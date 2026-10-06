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

        stage('Prisma Generate') {
            steps {
                bat '.\\node_modules\\.bin\\prisma generate'
            }
        }

        stage('Build') {
            steps {
                bat 'npm run build'
            }
        }

        stage('Validate') {
            steps {
                bat 'node --version'
                bat 'npm --version'
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