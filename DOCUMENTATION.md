# Generate Synthetic Data

```
Create an ELITE-level GPT-4o fine-tuning dataset from https://www.krishnaik.in/projects.

Goal:
Train a model that behaves like an AI Project Mentor.

Generate 400–600 examples in JSONL chat format.

Include advanced training patterns:

- multi-turn reasoning
- project recommendation based on user goals
- skill-gap analysis
- roadmap planning
- architecture/system design explanation
- comparison with reasoning
- deployment and MLOps discussion

Dataset rules:

- high diversity
- no repetitive phrasing
- realistic user questions
- mentor-style assistant responses
- balanced beginner → advanced coverage

Output:

1. Create downloadable JSONL file.
2. Provide only the download link + dataset stats.
```

## System Prompt

```
You are a professional and friendly customer support assistant. You are knowledgeable, empathetic, and always aim to resolve customer issues efficiently. Provide clear, concise, and helpful responses. If you cannot resolve an issue, politely guide the customer to escalate to a human agent.
```

## AntiGravity Prompt

```
Okk so i basically  used azure foundary to fine tune a gpt 40 model on my custom dataset and it is trained now i test it on the playground also
Now i want you to make a full web application bot for that model baisclaly it is customer support bot like i need a very good ui use whatver tech u want like node js or whatver frot end u want just make it look good and evrything should be fucntional  

Now as matter of how we integrate the model has given some samaples i will share it here
Get Started
Below are example code snippets for a few use cases. For additional information about Azure OpenAI SDK, see full documentation  and samples.
```

### Copy Paste from website all details then use this in a single prompt

```
Dont use environment varaibles ask for api in user interface only also create a reach vite app
Do not create backend server i want a proper frontend application as it will b deployed in S3 bucket.
```

# CI-CD Deployment Phase

### Things to make sure:
- Make sure your repo has been pushed to GitHub Properly
---
## ➡️ Step 1 - Create S3 Bucket for Hosting

For the deploy provider we are going to use Amazon S3, we will create an S3 bucket.
1. Head over to the S3 service.
2. Click Create bucket.
3. Name it something unique like `my-react-cicd-demo`

![Image](https://github.com/user-attachments/assets/5e772a9f-c278-499c-975d-b1590f962e50)

Once the s3 bucket is created, leave it for now, as we will come for it to finish the setup later.


## ➡️ Step 3 - Create CodePipeline

Now the fun part—building the pipeline.

1. Go to AWS CodePipeline, click Create pipeline.
2. Name your pipeline: `reactapp-cicd-demo`
3. Choose a new service role or an existing one.

![Image](https://github.com/user-attachments/assets/718b0040-e0f8-43e4-81ce-3b7e6d55c162)

4. Add source stage:
<br>- Source provider: GitHub (connect your GitHub account).
<br>- Select your repository and branch.

⚠️Note: Make sure you select the repository that we cloned in Step 1

![Image](https://github.com/user-attachments/assets/7d7d6e7f-8a39-47e3-9271-ffa8c045c3cf)

<br>- Once you are connected to your Github and select your repository, then choose "Next"

![Image](https://github.com/user-attachments/assets/2177e920-30a3-4196-b673-5ae4f1733391)

5. Add build stage:
<br>- Provider: AWS CodeBuild.
<br>- Choose "Create project"

Let's proceed to next step and create the CodeBuild Project.

## ➡️ Step 4 - Create CodeBuild Project

Now let’s set up CodeBuild, which will handle building the React app.

1. Go to CodeBuild, click Create Build Project.
2. Name it something like `react-cicd-pipeline-demo`

![Image](https://github.com/user-attachments/assets/4f26b687-a04f-409d-877f-092e8dc59f46)

3. Choose a managed image: aws/codebuild/standard:6.0 (or latest).
4. Under build specifications, choose "Use a buildspec file" 

![Image](https://github.com/user-attachments/assets/85452545-3411-4766-84ae-b9571389c11f)

5. Inside your GitHub repo, create a file named `buildspec.yml` in the root:

```yaml
version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 18
    commands:
      - echo Installing dependencies...
      - npm ci --legacy-peer-deps

  build:
    commands:
      - echo Building the React app...
      - npm run build

artifacts:
  files:
    - '**/*'
  base-directory: dist
  discard-paths: no


```

⚠️Note: This file tells CodeBuild to install dependencies, build the app, and copy the contents of the build/ folder as artifacts.

6. Back to the CodeBuild Project, keep the rest as default and choose "Continue to CodePipeline"
7. Then the CodeBuild project will be create and added to the build stage as shown below, then choose "Next"

![Image](https://github.com/user-attachments/assets/d5d2ffa9-7c7b-4502-86af-689f7bbe0dec)

8. Add deploy stage:
<br>- Provider: Amazon S3.
<br>- Bucket: Select the one you created earlier `my-react-cicd-demo`
<br>- Extract file option: YES, choose "Next"

![Image](https://github.com/user-attachments/assets/ed4dfacf-40f5-4ddb-bf0b-20837c37ac8c)

<br>- Lastly, review all the configuration and click "Create pipeline"

Once the pipeline is successfully created, you’ll see it run through the `source` `build` and `deploy` stages.

## Let's finish our S3 Buckect configuration

1. Go to Amazon S3 console
2. Select our existing S3 bucket `my-react-cicd-demo`
3. You should see the S3 bucket with objects inside, extracted from our CodePipeline.
4. Now let's make this S3 Bucket public:
<br>- On the top bar, choose "Properties"

![Image](https://github.com/user-attachments/assets/d0f13940-48fc-42ab-a42b-f57fca2eb618)

<br>- Scroll down to "Static Website Hosting" and click "Edit"

![Image](https://github.com/user-attachments/assets/24f26fed-ec71-4a0b-96df-72f51de20d02)

<br>- Under "Static Website Hosting", choose "Enable"
<br>- And specify `index.html` as the index document, then click "Save"

![Image](https://github.com/user-attachments/assets/c25619a1-822a-40bd-b43a-f941c6c2c3c8)

<br>- Next, edit some permissions, still on the tob bar choose "Permissions"
<br>- Uncheck "Block all public access" to allow public access, then click "Save changes"

![Image](https://github.com/user-attachments/assets/e4c76949-667c-4cba-a6ef-637e4d3dcc4a)

<br>- Next, we will add a bucket policy to allow public read access inside our s3 bucket. Here's the sample policy you can use:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```
⚠️ Replace: `your-bucket-name` with your actual bucket name, then click "Save"

![Image](https://github.com/user-attachments/assets/625e9e8b-88ec-413d-931d-922cd21303d8)

<br>- Go back to the S3 Bucket console, on the top bar, choose Objects, then click on `index.html`
<br>- To visit your React.js App, click on the Object URL.

![Image](https://github.com/user-attachments/assets/ad404089-e051-40a6-b6c3-6de7a1acc4df)

<br>- You should see your React.js App running on Amazon S3



## ➡️ Step 5 - Test the Pipeline

Let’s test the whole pipeline. I’ll make a small change to the homepage text and push it to GitHub.

As soon as the code is pushed, CodePipeline is triggered. You’ll see it run through the source, build, and deploy stages.

![Image](https://github.com/user-attachments/assets/e2225370-5dd6-4665-92af-0fb6cc96d316)


## 🗑️ Clean Up Resources

When you’re done, clean up your AWS resources to avoid charges.
