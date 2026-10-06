pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm ci'
            }
        }

        stage('Build') {
            steps {
                bat 'npm run build'
            }
        }

        stage('Validate') {
            steps {
                bat 'npm run lint'
            }
        }

        stage('Docker Build') {
            steps {
                bat 'docker build -t influ-store:build-%BUILD_NUMBER% .'
            }
        }
    }

    post {
        success {
            echo 'InfluStore CI pipeline completed successfully!'
        }

        failure {
            echo 'InfluStore CI pipeline failed. Check the console output.'
        }
    }
}