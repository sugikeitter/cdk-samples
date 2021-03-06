#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Ec2AsgStack } from '../lib/ec2-asg-stack';
import { EcsAlbPatternStack } from '../lib/ecs-alb-pattern-stack';
import { VpcStack } from '../lib/vpc-stack';
import { RdsPostgresStack } from '../lib/rds-postgres-stack';
import { RdsAuroraMysqlStack } from '../lib/rds-aurora-mysql-stack';

const app = new cdk.App();
new Ec2AsgStack(app, 'Ec2AsgStack', {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
  env: { account: process.env.AWS_ACCOUNT_ID, region: process.env.AWS_REGION }
});

const vpcStack = new VpcStack(app, 'VpcStack', {
  // To use more than 2 AZs, be sure to specify the account and region on your stack.
  env: { account: process.env.AWS_ACCOUNT_ID, region: process.env.AWS_REGION }
});

const ecsAlbPatternStack = new EcsAlbPatternStack(app, 'EcsAlbPatternStack', {
  env: { account: process.env.AWS_ACCOUNT_ID, region: process.env.AWS_REGION },
  vpc: vpcStack.vpc,
});
ecsAlbPatternStack.addDependency(vpcStack);

const rdsPostgresStack = new RdsPostgresStack(app, 'RdsPostgresStack', {
  env: { account: process.env.AWS_ACCOUNT_ID, region: process.env.AWS_REGION },
  vpc: vpcStack.vpc,
});
rdsPostgresStack.addDependency(vpcStack);

const rdsAuroraMysqlStack = new RdsAuroraMysqlStack(app, 'RdsAuroraMysqlStack', {
  env: { account: process.env.AWS_ACCOUNT_ID, region: process.env.AWS_REGION },
  vpc: vpcStack.vpc,
});
rdsAuroraMysqlStack.addDependency(vpcStack);