import {
  Stack,
  StackProps,
  aws_ec2 as ec2,
  aws_ecr as ecr,
  aws_ecs as ecs,
  aws_ecs_patterns as ecs_patterns

} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class EcsAlbPatternStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const MY_VPC_NAME = process.env.MY_VPC_NAME;
    const MY_ECR_REPOSITORY_NAME = process.env.MY_ECR_REPOSITORY_NAME || ""

    // TODO vpc名をCFnテンプレート作成時に渡す
    const vpc: ec2.IVpc = ec2.Vpc.fromLookup(this, 'Vpc', {
      vpcName: MY_VPC_NAME
    });

    // CI/CDを見越して、CFnの状態をリソースと同期させたいなら、ECSのクラスタとALBとListner/TargetGroupのみの定義（変更があまりない）
    // ECSサービスとCodePipelineを別Stackで用意するのが良さそう（変更が多い？）
    new ecs_patterns.ApplicationLoadBalancedFargateService(this, 'EcsAlbFargateSvcPattern', {
      vpc: vpc,
      taskSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_NAT
      },
      taskImageOptions: {
        image: ecs.ContainerImage.fromEcrRepository(
          ecr.Repository.fromRepositoryName(this, "EcrRepo", MY_ECR_REPOSITORY_NAME),
          "latest", // tag
        ),
      },
      desiredCount: 3,
      deploymentController: {
        type: ecs.DeploymentControllerType.CODE_DEPLOY,
      },
      // loadBalancer: // Blue/Greenデプロイのためにポート2つ用意したALBが必要な場合は、別途用意が必要
    });

    // TODO ECSでBlue/GreenするためのCodeDeployを追加したい（でも最終的にはCodePipeline？）

  }
}