// TODO import の書き方
import {
  Stack,
  StackProps,
  aws_ec2 as ec2,
  aws_ecs as ecs,
  aws_ecs_patterns as ecs_patterns

} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class EcsAsgStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpcName = process.env.MY_VPC_NAME;

    // TODO vpc名をCFnテンプレート作成時に渡す
    const vpc: ec2.IVpc = ec2.Vpc.fromLookup(this, 'Vpc', {
      vpcName: vpcName
    });

    new ecs_patterns.ApplicationLoadBalancedFargateService(this, 'EcsAlbFargateSvcPattern', {
      vpc: vpc,
      taskSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_NAT
      },
      taskImageOptions: {
        image: ecs.ContainerImage.fromRegistry('amazon/amazon-ecs-sample'),
      },
    })

  }
}