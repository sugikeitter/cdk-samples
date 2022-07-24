import {
  Stack,
  StackProps,
  aws_iam as iam,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class IamDemoStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    // IAMユーザーをdemo-***という名前で権限をEC2のReadOnlyで手動で作るけど、EC2のReadOnly+起動/停止できるロール
    const role = new iam.Role(this, 'DemoRoleForEC2RunStartStop', {
      roleName: "DemoRoleForEC2RunStartStop",
      assumedBy: new iam.ArnPrincipal("arn:aws:iam::" + props.env?.account + ":user/demo-ec2-readonly"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEC2ReadOnlyAccess"),
      ],
      // EC2インスタンス起動のためにRoleを作成できてしまうポリシーが割り当てられている
      inlinePolicies: {
        "ec2RunStartStop": iam.PolicyDocument.fromJson({
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Action": [
                "ec2:RunInstances",
                "ec2:CreateTags",
                "ec2:StartInstances",
                "ec2:StopInstances",
                "iam:ListInstanceProfiles",
                "iam:GetRole",
                // "iam:PassRole",
                // "iam:CreateRole",
                // "iam:CreateInstanceProfile",
                "iam:ListPolicies",
                "iam:ListRoles",
                "iam:AttachRolePolicy"
              ],
              "Resource": "*"
            },
            {
              "Effect": "Allow",
              "Action": [
                "iam:PassRole"
              ],
              "Resource": [
                "arn:aws:iam::" + props.env?.account + ":role/AmazonSSMRoleForInstancesQuickSetup"
              ],
              "Condition": {
                "StringEquals": {"iam:PassedToService": "ec2.amazonaws.com"},
              }
            }
          ]
        })
      },
    });

    const policyForBoundary = new iam.ManagedPolicy(this, 'policyForBoundary', {
      managedPolicyName: 'DemoPlicyForBoundary',
      document: iam.PolicyDocument.fromJson({
        "Version": "2012-10-17",
        "Statement": [
          {
            "Effect": "Allow",
            "Action": [
              "ec2:RunInstances",
              "ec2:CreateTags",
              "ec2:StartInstances",
              "ec2:StopInstances",
              "iam:ListInstanceProfiles",
              "iam:GetRole",
              // "iam:PassRole", // EC2, LambdaのみOKのConditionを下で設定
              "iam:CreateRole",
              "iam:CreateInstanceProfile",
              "iam:ListPolicies",
              "iam:ListRoles",
              "iam:AttachRolePolicy"
            ],
            "Resource": "*"
          },
          {
            "Effect": "Allow",
            "Action": [
              "iam:PassRole"
            ],
            "Resource": [
              "arn:aws:iam::" + props.env?.account + ":role/demoBoundaryRole*",
              "arn:aws:iam::" + props.env?.account + ":role/AmazonSSMRoleForInstancesQuickSetup"
            ],
            "Condition": {
              "StringEquals": {"iam:PassedToService": "ec2.amazonaws.com"},
            }
          },
          {
            "Effect": "Allow",
            "Action": [
              "iam:PassRole"
            ],
            "Resource": "arn:aws:iam::" + props.env?.account + ":role/demoBoundaryRole*",
            "Condition": {
              "StringEquals": {"iam:PassedToService": "lambda.amazonaws.com"},
            }
          },
          {
            "Sid": "DenyPermBoundaryIAMPolicyAlteration",
            "Effect": "Deny",
            "Action": [
              "iam:DeletePolicy",
              "iam:DeletePolicyVersion",
              "iam:CreatePolicyVersion",
              "iam:SetDefaultPolicyVersion"
            ],
            "Resource": [
              "arn:aws:iam::" + props.env?.account + ":policy/DemoPlicyForBoundary"
            ]
          },
          {
            "Sid": "DenyRemovalOfPermBoundaryFromAnyUserOrRole",
            "Effect": "Deny",
            "Action": [
              "iam:DeleteUserPermissionsBoundary",
              "iam:DeleteRolePermissionsBoundary"
            ],
            "Resource": [
              "arn:aws:iam::" + props.env?.account + ":user/*",
              "arn:aws:iam::" + props.env?.account + ":role/*"
            ],
            "Condition": {
              "StringEquals": {
                "iam:PermissionsBoundary": "arn:aws:iam::" + props.env?.account + ":policy/DemoPlicyForBoundary"
              }
            }
          },
          {
            "Sid": "DenyAccessIfRequiredPermBoundaryIsNotBeingApplied",
            "Effect": "Deny",
            "Action": [
              "iam:PutUserPermissionsBoundary",
              "iam:PutRolePermissionsBoundary",
              "iam:CreateUser"
            ],
            "Resource": [
              "arn:aws:iam::" + props.env?.account + ":user/*",
              "arn:aws:iam::" + props.env?.account + ":role/*"
            ],
            "Condition": {
              "StringNotEquals": {
                "iam:PermissionsBoundary": "arn:aws:iam::" + props.env?.account + ":policy/DemoPlicyForBoundary"
              }
            }
          },
          {
            "Sid": "DenyRoleCreationWithOutPrefix",
            "Effect": "Deny",
            "Action": [
              "iam:CreateRole"
            ],
            "NotResource": [
              "arn:aws:iam::" + props.env?.account + ":role/demoBoundaryRole*"
            ]
          },
          {
            "Sid": "DenyRoleCreationWithOutPermBoundary",
            "Effect": "Deny",
            "Action": [
              "iam:CreateRole"
            ],
            "Resource": [
              "*"
            ],
            "Condition": {
              "StringNotEquals": {
                "iam:PermissionsBoundary": "arn:aws:iam::" + props.env?.account + ":policy/DemoPlicyForBoundary"
              }
            }
          },
          {
            "Effect": "Allow",
            "Action": [
              "ec2:RunInstances",
              "ec2:CreateTags",
              "ec2:StartInstances",
              "ec2:StopInstances",
              "iam:ListInstanceProfiles",
            ],
            "Resource": "*"
          }
        ]
      })
    });

    const roleWithPermissionBoundary = new iam.Role(this, 'DemoRoleForEC2RunStartStopWithPermBooundary', {
      roleName: "DemoRoleForEC2RunStartStopWithPermBooundary",
      assumedBy: new iam.ArnPrincipal("arn:aws:iam::" + props.env?.account + ":user/demo-ec2-readonly"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEC2ReadOnlyAccess"),
      ],
      // EC2インスタンス起動のためにRoleを作成できてしまうポリシーが割り当てられているが、PermissionBoundaryが付いている
      inlinePolicies: {
        "ec2RunStartStop": iam.PolicyDocument.fromJson({
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Action": [
                "ec2:RunInstances",
                "ec2:CreateTags",
                "ec2:StartInstances",
                "ec2:StopInstances",
                "iam:ListInstanceProfiles",
                "iam:GetRole",
                "iam:PassRole",
                "iam:CreateRole",
                "iam:CreateInstanceProfile",
                "iam:ListPolicies",
                "iam:ListRoles",
                "iam:AttachRolePolicy"
              ],
              "Resource": "*"
            }
          ]
        })
      },
      permissionsBoundary: policyForBoundary
    });
  }
}
