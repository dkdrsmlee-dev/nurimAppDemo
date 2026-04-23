pipeline {
  agent any

  options {
    disableConcurrentBuilds()
    timestamps()
  }

  environment {
    COMPOSE_FILE = 'docker-compose.front.yml'
    FRONT_SERVICE = 'nurim-front'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Docker Check') {
      steps {
        sh 'docker version'
        sh 'docker compose version'
        sh 'docker ps'
      }
    }

    stage('Build Front Image') {
      steps {
        sh 'docker compose -f "$COMPOSE_FILE" build --pull "$FRONT_SERVICE"'
      }
    }

    stage('Deploy Front Container') {
      steps {
        sh 'docker compose -f "$COMPOSE_FILE" up -d --no-deps "$FRONT_SERVICE"'
      }
    }

    stage('Verify Front Container') {
      steps {
        sh 'docker ps --filter "name=$FRONT_SERVICE" --filter "status=running" --format "{{.Names}}" | grep -x "$FRONT_SERVICE"'
        sh 'docker port "$FRONT_SERVICE"'
      }
    }
  }

  post {
    failure {
      sh 'docker compose -f "$COMPOSE_FILE" logs --tail=120 "$FRONT_SERVICE" || true'
    }
  }
}
