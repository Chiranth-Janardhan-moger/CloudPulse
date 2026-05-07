const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { EC2Client, DescribeInstancesCommand, StopInstancesCommand } = require('@aws-sdk/client-ec2');
const { CloudWatchClient, GetMetricStatisticsCommand } = require('@aws-sdk/client-cloudwatch');
const { CostExplorerClient, GetCostAndUsageCommand } = require('@aws-sdk/client-cost-explorer');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// AWS Configuration
const awsConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
};

const ec2Client = new EC2Client(awsConfig);
const cloudWatchClient = new CloudWatchClient(awsConfig);

// Helper function to get instance name from tags
const getInstanceName = (tags) => {
  if (!tags) return 'N/A';
  const nameTag = tags.find(tag => tag.Key === 'Name');
  return nameTag ? nameTag.Value : 'N/A';
};

// Helper function to calculate estimated monthly cost
const calculateMonthlyCost = (instanceType) => {
  // Simplified cost estimation (actual costs vary by region and pricing model)
  const costMap = {
    't2.micro': 8.35,
    't2.small': 16.79,
    't2.medium': 33.58,
    't3.micro': 7.59,
    't3.small': 15.18,
    't3.medium': 30.37,
    'm5.large': 69.35,
    'm5.xlarge': 138.70,
    'c5.large': 61.63,
    'c5.xlarge': 123.26,
  };
  return costMap[instanceType] || 50; // Default estimate
};

// API: Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// API: Fetch all EC2 instances from all regions
app.get('/api/instances', async (req, res) => {
  try {
    // Get credentials from headers or environment
    const accessKeyId = req.headers['x-aws-access-key-id'] || process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = req.headers['x-aws-secret-access-key'] || process.env.AWS_SECRET_ACCESS_KEY;

    // Validate AWS credentials
    if (!accessKeyId || !secretAccessKey) {
      return res.status(400).json({ 
        error: 'AWS credentials not configured. Please provide credentials or set them in .env file' 
      });
    }

    // Common AWS regions (enabled by default in most accounts)
    const regions = [
      'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
      'ap-south-1', 'ap-southeast-1', 'ap-southeast-2', 
      'ap-northeast-1', 'ap-northeast-2', 'ap-northeast-3',
      'ca-central-1',
      'eu-central-1', 'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-north-1',
      'sa-east-1',
      // Opt-in regions (commented out - uncomment if enabled in your account)
      // 'af-south-1', 'ap-east-1', 'ap-south-2', 'ap-southeast-3', 'ap-southeast-4',
      // 'ca-west-1', 'eu-central-2', 'eu-south-1', 'eu-south-2',
      // 'il-central-1', 'me-south-1', 'me-central-1'
    ];

    const allInstances = [];

    // Fetch instances from all regions in parallel
    const regionPromises = regions.map(async (region) => {
      try {
        const clientConfig = {
          region,
          credentials: {
            accessKeyId,
            secretAccessKey,
          },
        };

        const ec2 = new EC2Client(clientConfig);
        const command = new DescribeInstancesCommand({});
        const response = await ec2.send(command);

        const regionInstances = [];
        
        if (response.Reservations) {
          for (const reservation of response.Reservations) {
            for (const instance of reservation.Instances) {
              regionInstances.push({
                instanceId: instance.InstanceId,
                instanceName: getInstanceName(instance.Tags),
                instanceType: instance.InstanceType,
                state: instance.State.Name,
                launchTime: instance.LaunchTime,
                publicIp: instance.PublicIpAddress || 'N/A',
                privateIp: instance.PrivateIpAddress || 'N/A',
                availabilityZone: instance.Placement.AvailabilityZone,
                region: region,
              });
            }
          }
        }

        return regionInstances;
      } catch (error) {
        console.error(`Error fetching instances from ${region}:`, error.message);
        return [];
      }
    });

    const results = await Promise.all(regionPromises);
    results.forEach(regionInstances => {
      allInstances.push(...regionInstances);
    });

    res.json({ instances: allInstances });
  } catch (error) {
    console.error('Error fetching instances:', error);
    res.status(500).json({ 
      error: 'Failed to fetch EC2 instances', 
      message: error.message,
      details: error.name === 'CredentialsProviderError' ? 'Invalid AWS credentials' : error.message
    });
  }
});

// API: Fetch CPU metrics for an instance
app.get('/api/metrics/:instanceId', async (req, res) => {
  try {
    const { instanceId } = req.params;
    const region = req.query.region || 'us-east-1';
    
    // Get credentials from headers or environment
    const accessKeyId = req.headers['x-aws-access-key-id'] || process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = req.headers['x-aws-secret-access-key'] || process.env.AWS_SECRET_ACCESS_KEY;
    
    // Validate AWS credentials
    if (!accessKeyId || !secretAccessKey) {
      return res.status(400).json({ 
        error: 'AWS credentials not configured' 
      });
    }

    const clientConfig = {
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    };

    const cloudWatch = new CloudWatchClient(clientConfig);

    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

    const command = new GetMetricStatisticsCommand({
      Namespace: 'AWS/EC2',
      MetricName: 'CPUUtilization',
      Dimensions: [
        {
          Name: 'InstanceId',
          Value: instanceId,
        },
      ],
      StartTime: startTime,
      EndTime: endTime,
      Period: 3600, // 1 hour intervals
      Statistics: ['Average'],
    });

    const response = await cloudWatch.send(command);
    
    // Calculate average CPU usage
    let avgCpu = 0;
    if (response.Datapoints && response.Datapoints.length > 0) {
      const sum = response.Datapoints.reduce((acc, dp) => acc + dp.Average, 0);
      avgCpu = sum / response.Datapoints.length;
    }

    const isIdle = avgCpu < 5;

    res.json({
      instanceId,
      datapoints: response.Datapoints || [],
      averageCpu: avgCpu.toFixed(2),
      isIdle,
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch CloudWatch metrics', 
      message: error.message 
    });
  }
});

// API: Stop an EC2 instance
app.post('/api/instances/:instanceId/stop', async (req, res) => {
  try {
    const { instanceId } = req.params;
    const region = req.body.region || 'us-east-1';

    // Get credentials from headers or environment
    const accessKeyId = req.headers['x-aws-access-key-id'] || process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = req.headers['x-aws-secret-access-key'] || process.env.AWS_SECRET_ACCESS_KEY;

    // Validate AWS credentials
    if (!accessKeyId || !secretAccessKey) {
      return res.status(400).json({ 
        error: 'AWS credentials not configured' 
      });
    }

    const clientConfig = {
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    };

    const ec2 = new EC2Client(clientConfig);
    const command = new StopInstancesCommand({
      InstanceIds: [instanceId],
    });

    const response = await ec2.send(command);

    res.json({
      message: 'Instance stop initiated',
      instanceId,
      stoppingInstances: response.StoppingInstances,
    });
  } catch (error) {
    console.error('Error stopping instance:', error);
    res.status(500).json({ 
      error: 'Failed to stop EC2 instance', 
      message: error.message 
    });
  }
});

// API: Get billing information
app.get('/api/billing', async (req, res) => {
  try {
    // Get credentials from headers or environment
    const accessKeyId = req.headers['x-aws-access-key-id'] || process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = req.headers['x-aws-secret-access-key'] || process.env.AWS_SECRET_ACCESS_KEY;

    // Validate AWS credentials
    if (!accessKeyId || !secretAccessKey) {
      return res.status(400).json({ 
        error: 'AWS credentials not configured' 
      });
    }

    const clientConfig = {
      region: 'us-east-1', // Cost Explorer is only available in us-east-1
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    };

    const costExplorer = new CostExplorerClient(clientConfig);

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    // Format dates as YYYY-MM-DD
    const formatDate = (date) => date.toISOString().split('T')[0];

    // Get current month cost
    const currentMonthCommand = new GetCostAndUsageCommand({
      TimePeriod: {
        Start: formatDate(currentMonthStart),
        End: formatDate(now),
      },
      Granularity: 'MONTHLY',
      Metrics: ['UnblendedCost'],
    });

    // Get last month cost
    const lastMonthCommand = new GetCostAndUsageCommand({
      TimePeriod: {
        Start: formatDate(lastMonthStart),
        End: formatDate(lastMonthEnd),
      },
      Granularity: 'MONTHLY',
      Metrics: ['UnblendedCost'],
    });

    // Get year to date cost
    const yearCommand = new GetCostAndUsageCommand({
      TimePeriod: {
        Start: formatDate(yearStart),
        End: formatDate(now),
      },
      Granularity: 'MONTHLY',
      Metrics: ['UnblendedCost'],
    });

    const [currentMonthResponse, lastMonthResponse, yearResponse] = await Promise.all([
      costExplorer.send(currentMonthCommand),
      costExplorer.send(lastMonthCommand),
      costExplorer.send(yearCommand),
    ]);

    // Extract costs
    const getCurrentCost = (response) => {
      if (response.ResultsByTime && response.ResultsByTime.length > 0) {
        return parseFloat(response.ResultsByTime[0].Total.UnblendedCost.Amount);
      }
      return 0;
    };

    const getYearTotal = (response) => {
      if (response.ResultsByTime && response.ResultsByTime.length > 0) {
        return response.ResultsByTime.reduce((sum, item) => {
          return sum + parseFloat(item.Total.UnblendedCost.Amount);
        }, 0);
      }
      return 0;
    };

    const currentMonthCost = getCurrentCost(currentMonthResponse);
    const lastMonthCost = getCurrentCost(lastMonthResponse);
    const yearToDateCost = getYearTotal(yearResponse);

    // Get monthly breakdown for the year
    const monthlyBreakdown = yearResponse.ResultsByTime?.map(item => ({
      month: item.TimePeriod.Start,
      cost: parseFloat(item.Total.UnblendedCost.Amount),
    })) || [];

    res.json({
      currentMonth: {
        cost: currentMonthCost.toFixed(2),
        period: `${formatDate(currentMonthStart)} to ${formatDate(now)}`,
      },
      lastMonth: {
        cost: lastMonthCost.toFixed(2),
        period: `${formatDate(lastMonthStart)} to ${formatDate(lastMonthEnd)}`,
      },
      yearToDate: {
        cost: yearToDateCost.toFixed(2),
        period: `${formatDate(yearStart)} to ${formatDate(now)}`,
      },
      monthlyBreakdown,
    });
  } catch (error) {
    console.error('Error fetching billing:', error);
    res.status(500).json({ 
      error: 'Failed to fetch billing information', 
      message: error.message,
      details: error.name === 'AccessDeniedException' ? 'Cost Explorer access denied. Ensure IAM user has ce:GetCostAndUsage permission.' : error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`AWS Region: ${process.env.AWS_REGION || 'us-east-1'}`);
});
