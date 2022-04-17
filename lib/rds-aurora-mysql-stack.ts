import {
  Stack,
  StackProps,
  aws_ec2 as ec2,
  aws_rds as rds,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface RdsAuroraMysqlStackProps extends StackProps {
  vpc: ec2.Vpc;
}

export class RdsAuroraMysqlStack extends Stack {
  constructor(scope: Construct, id: string, props: RdsAuroraMysqlStackProps) {
    super(scope, id, props);

    // TODO INを許可するSGをEC2/ECSから連携する
    new rds.DatabaseCluster(this, "DbCluster", {
      engine: rds.DatabaseClusterEngine.auroraMysql({
        version: rds.AuroraMysqlEngineVersion.VER_3_01_0,
      }),
      instanceProps: {
        vpc: props.vpc,
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM),
      },
    })
  }
}