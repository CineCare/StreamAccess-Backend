pipeline {
    agent any

    tools {
        nodejs 'nodeJS'
    }

    options { buildDiscarder(logRotator(numToKeepStr: '5')) }

    environment {
        DOCKER_CREDENTIALS = credentials('codevertDocker')
        DOCKER_TAG = "${env.BRANCH_NAME == 'main' ? 'latest' : env.BRANCH_NAME}"
        ENV_ID = "${env.BRANCH_NAME == 'main' ? 'streamaccess_backend_env' : "streamacces_backend_env_" + env.BRANCH_NAME}"
        DISCORD_WEBHOOK = credentials('discord-webhook')
    }
    
    stages {
        stage('Clean') {
            steps {
                cleanWs()
                sh 'echo ${BRANCH_NAME}'
                sh 'echo ${DOCKER_TAG}'
                sh 'echo ${ENV_ID}'
            }
        }

        stage('pull sources') {
            steps {
                git branch: '${BRANCH_NAME}',
                credentialsId: 'github_ssh',
                url: 'git@github.com:CineCare/StreamAccess-Backend.git'
                script {
                    env.GIT_COMMIT_MSG = sh(script: 'git log -1 --pretty=%B ${GIT_COMMIT}', returnStdout: true).trim()
                }
            }
        }

        stage('install') {
            steps {
                echo 'performing install...'
                sh '''
                    npm install
                '''
            }
        }

        stage('lint') {
            steps {
                sh '''
                    npm run ci_lint
                    ls
                '''
            }
        }

        stage('test') {
            steps {
                echo 'performing test...'
                sh '''
                    npm run ci_tests
                '''
            }
            post {
                always {
                    junit "test-results/test-results.xml"
                    recordIssues aggregatingResults: true, enabledForFailure: true, failOnError: true, ignoreQualityGate: false, skipPublishingChecks: true, sourceDirectories: [[path: 'src']], tools: [checkStyle(pattern: 'eslint.xml')]
                }
            }
        }

        stage('SonarQube analysis') {
            steps {
                script {
                    scannerHome = tool 'SonarQubeScanner'
                }
                withSonarQubeEnv('SonarQubeServer') {
                    sh "${scannerHome}/bin/sonar-scanner"
                }
            }
        }

        stage('Sonar Quality Gate') {
            steps {
                timeout(time: 1, unit: 'HOURS') {
                    script {
                        def qg = waitForQualityGate()
                        if(qg.status == 'ERROR') {
                            unstable('Quality gate failed')
                        }
                    }
                }
            }
        }

        stage('build & push docker image') {
            when {
                expression { env.BRANCH_NAME == 'main' || env.BRANCH_NAME == 'dev'}
            }
            steps {
                //copy .env file from jenkins credentials to current workspace
                withCredentials([file(credentialsId: "${ENV_ID}", variable: 'envFile')]){
                    sh 'cp $envFile $WORKSPACE'
                }
                //connect to docker hub, build image and push to registry
                sh '''
                    echo $DOCKER_CREDENTIALS_PSW | docker login localhost:5000 -u $DOCKER_CREDENTIALS_USR --password-stdin
                    docker build -t "localhost:5000/streamaccess:backend_${DOCKER_TAG}" .
                    docker push localhost:5000/streamaccess:backend_${DOCKER_TAG}
                '''
            }
        }

        stage('Update stack portainer') {
            when {
                expression { env.BRANCH_NAME == 'main' || env.BRANCH_NAME == 'dev'}
            }
            steps {
                //stop and restart portainer stack via api
                withCredentials([string(credentialsId: 'portainer_token', variable: 'TOKEN')]) { //set SECRET with the credential content
                    sh '''
                        curl -X POST -H "X-API-Key: ${TOKEN}" https://portainer.codevert.org/api/stacks/7/stop?endpointId=2 &&
                        curl -X POST -H "X-API-Key: ${TOKEN}" https://portainer.codevert.org/api/stacks/7/start?endpointId=2
                    '''
                }
                unstable('test')
            }
        }
    }

    post {
        changed {
            script {
                def messageResult = "is unknown"
                def footer = "What happened ?"
                def smiley = "🤔"
                if (currentBuild.currentResult == 'SUCCESS') {
                    messageResult = "succeed"
                    footer = "Good job !"
                    smiley = "😎"
                }
                if (currentBuild.currentResult == 'success') {
                    messageResult = "succeed"
                    footer = "Good job !"
                    smiley = "😎"
                }
                if (currentBuild.currentResult == 'UNSTABLE') {
                    messageResult = "is unstable"
                    footer = "Let's make it cleaner !"
                    smiley = "🫤"
                }
                if (currentBuild.currentResult == 'FAILURE') {
                    messageResult = "failed"
                    footer = "Better luck next try ?"
                    smiley = "😭"
                }
                sh 'echo ${GIT_COMMIT_MSG}'
                discordSend description: "Jenkins Pipeline Build for StreamAccess-Backend ${BRANCH_NAME} ${messageResult} ! ☹️\n\ngit commit message :\n${GIT_COMMIT_MSG}",
                footer: "Better luck next try ?",
                link: "$BUILD_URL",
                result: currentBuild.currentResult,
                title: JOB_NAME,
                webhookURL: "${DISCORD_WEBHOOK}"
            }
            
        }
    }
}
