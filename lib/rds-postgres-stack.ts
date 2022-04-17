import {
  Stack,
  StackProps,
  aws_ec2 as ec2,
  aws_rds as rds,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface RdsPostgresStackProps extends StackProps {
  vpc: ec2.Vpc;
}

export class RdsPostgresStack extends Stack {
  constructor(scope: Construct, id: string, props: RdsPostgresStackProps) {
    super(scope, id, props);

    new rds.DatabaseInstance(this, "RdsPostgres", {
      engine: rds.DatabaseInstanceEngine.postgres({ version: rds.PostgresEngineVersion.VER_14_1 }),
      vpc: props.vpc
    });
  }
}