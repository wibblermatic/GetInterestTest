# GetInterestTest

This project contains source code and supporting files for a serverless application, together with corresponding API Gateway RESTful endpoint.

The application takes the following parameters:
* balance (decimal)
* currency (e.g. £)

and calculates the corresponding interest, returning it as JSON:

{
  "interest": "[amount, including currency]"
}

At present the interest rates and threshold points are hard-coded, but in a 'real' application these would be configurable as threshold / interest rate pairs in e.g. DynamoDB to provide Business flexibility. 

In this case, the application would query the DB to obtain the interest rate corresponding to the highest threshold value that is lower or equal to the balance, and then use this for the interest calculation. 
(Thresholds would be set in line with this logic, e.g. 0 = 1.0, 1000 = 1.5, 5000 = 2 and so on).

## Project structure

The project can be deployed with the SAM CLI. It includes the following files and folders.

- get-interest - Code for the application's Lambda function.
- events - Invocation events that can be used to invoke the function.
- get-interest/tests - Unit tests for the application code. 
- template.yaml - A template that defines the application's AWS resources.

The application uses several AWS resources, including Lambda functions and an API Gateway API. These resources are defined in the `template.yaml` file in this project.

## Deploy the application

The Serverless Application Model Command Line Interface (SAM CLI) is an extension of the AWS CLI that adds functionality for building and testing Lambda applications. It uses Docker to run the functions in an Amazon Linux environment that matches Lambda. It can also emulate the application's build environment and API.

To use the SAM CLI, you need the following tools.

* SAM CLI - [Install the SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
* Node.js - [Install Node.js 10](https://nodejs.org/en/), including the NPM package management tool.
* Docker - [Install Docker community edition](https://hub.docker.com/search/?type=edition&offering=community)

To build and deploy the application for the first time, run the following in the shell:

```bash
sam build
sam deploy --guided
```

The first command will build the source of the application. The second command will package and deploy the application to AWS, with a series of prompts:

* **Stack Name**: The name of the stack to deploy to CloudFormation. This should be unique to the account and region, and a good starting point would be something matching the project name.
* **AWS Region**: The AWS region you want to deploy the app to.
* **Confirm changes before deploy**: If set to yes, any change sets will be shown to you before execution for manual review. If set to no, the AWS SAM CLI will automatically deploy application changes.
* **Allow SAM CLI IAM role creation**: Many AWS SAM templates, including this example, create AWS IAM roles required for the AWS Lambda function(s) included to access AWS services. By default, these are scoped down to minimum required permissions. To deploy an AWS CloudFormation stack which creates or modified IAM roles, the `CAPABILITY_IAM` value for `capabilities` must be provided. If permission isn't provided through this prompt, to deploy this example you must explicitly pass `--capabilities CAPABILITY_IAM` to the `sam deploy` command.
* **Save arguments to samconfig.toml**: If set to yes, the choices will be saved to a configuration file inside the project, so that in the future you can just re-run `sam deploy` without parameters to deploy changes to the application.

The API Gateway Endpoint URL is shown in the output values displayed after deployment.

NB: in order to run via AWS API Gateway, at present the input parameters need to be defined by hand (thse will be incorporated into the template for API Gateway in future release):
* balance (decimal)
* currency (e.g. £)

## Use the SAM CLI to build and test locally

Build the application with the `sam build` command.

```bash
GetInterestTest$ sam build
```

The SAM CLI installs dependencies defined in `get-interest/package.json`, creates a deployment package, and saves it in the `.aws-sam/build` folder.


## Unit tests

Tests are defined in the `get-interest/tests` folder in this project. Use NPM to install the [Mocha test framework](https://mochajs.org/) and run unit tests.

```bash
GetInterestTest$ cd get-interest
get-interest$ npm install
get-interest$ npm run test
```

NB: the tests need to be updated to pass in parameters and check outputs for a number of target test points:

| balance |	interest rate | calculated interest |
| ------- | ------------- | ------------------- |
| 0.01 | 1 | 0 |
| 1	| 1 | 0.01 |
| 999.99 | 1 | 10 |
| 1000 | 1.5 | 15 |
| 1001 | 1.5 | 15.02 |
| 4999.99 | 1.5 | 75 |
| 5000 | 2 | 100 |
| 9999.99 | 2 | 200 |
| 10000 | 2.5 | 250 |
| 49999.99 | 2.5 | 1250 |
| 50000 | 3 | 1500 |

Also, the parameter 'queryStringParameters' is not understood when run locally & causes error.

## Cleanup

To delete the created application, use the AWS CLI. Assuming the project name was used for the stack name, run the following:

```bash
aws cloudformation delete-stack --stack-name GetInterestTest
```

## TODO
* Make sure unit tests exercise the existing target thresholds & rates, both above and below, and work within CI/CD pipeline
* Ensure the whole solution is templated using CloudFormation, including ensuring Security requirements are addressed, and tagging for asset management (e.g. billing)
* Externalise interest rates and thresholds into DynamoDB
* Logging needs to be added and directed into CloudWatch Logs and / or S3
* Error handling improved to e.g. catch missing / incorrect input parameters, etc.
* Refactor interest rate calculation into a separate component that can be configured into the function, to allow different rate calculation mechanisms e.g. personal rate using AI & mining of logs & other customer data.
