import java.text.SimpleDateFormat

node {
   bitbucketStatusNotify(buildState: 'INPROGRESS')
   def dateFormat = new SimpleDateFormat("yyyy.MM.dd.HHmm")
   def date = new Date()
   
    nvm('v16.15.0') {
        sh 'env'
        try {
            checkout scm
            //JIRA integration test
            dir("functions"){

                stage("Build"){
                    bitbucketStatusNotify(buildState: 'INPROGRESS')
                    
                    echo "Build and deploy it to Acarin region"
                    shortCommit = sh(returnStdout: true, script: "git log -n 1 --pretty=format:'%s'").trim()
                    ISSUE_ID = find(shortCommit)
                    if(!ISSUE_ID){
                    echo "No Jira Issue ID found : ${ISSUE_ID}"
                    }

                    properties([
                        disableConcurrentBuilds(), 
                        [$class: 'BuildDiscarderProperty', strategy: [$class: 'LogRotator', artifactDaysToKeepStr: '5', artifactNumToKeepStr: '2', daysToKeepStr: '2', numToKeepStr: '2']]
                    ]);

                    sh 'pwd'
                    sh 'ls -ltr'
                    sh 'npm prune'
                    sh 'npm install'
                    sh './node_modules/.bin/firebase use default'
                    sh 'npm run lint'
                    sh 'npm run build'
                }

                stage("Test") {
                    // sh 'npm test'
                }

                if (env.BRANCH_NAME == 'master') {
                    stage("Deploy") {
                    withEnv(['GOOGLE_APPLICATION_CREDENTIALS=/var/lib/jenkins/evlotime/evlotime-dev.json']) {
                        sh './node_modules/.bin/firebase use default'
                        sh './node_modules/.bin/firebase deploy --only functions -P default --force'
                        // sh './node_modules/.bin/firebase deploy --only firestore:indexes --force'
                        // sh './node_modules/.bin/firebase deploy --only firestore:rules'
                    }
                    }
                }
                
                if (env.BRANCH_NAME.startsWith('release/')) {
                    stage("Deploy") {
                        withEnv(['GOOGLE_APPLICATION_CREDENTIALS=/var/lib/jenkins/evlotime/evlotime-demo.json']) {
                            sh './node_modules/.bin/firebase use staging'
                            sh './node_modules/.bin/firebase deploy --only functions -P staging --force'
                            // sh './node_modules/.bin/firebase deploy --only firestore:indexes --force'
                            // sh './node_modules/.bin/firebase deploy --only firestore:rules --force'
                        }
                    }
                }

                if (env.TAG_NAME && env.TAG_NAME.startsWith("prod/")) {
                    stage("Deploy To Production") {
                        withEnv(['GOOGLE_APPLICATION_CREDENTIALS=/var/lib/jenkins/evlotime/evlotime-prod.json']) {
                            sh './node_modules/.bin/firebase use prod'
                            sh './node_modules/.bin/firebase deploy --only functions -P prod --force'
                            // sh './node_modules/.bin/firebase deploy --only firestore:indexes --force'
                            // sh './node_modules/.bin/firebase deploy --only firestore:rules --force'
                        }
                    }
                }
            }

            bitbucketStatusNotify(buildState: 'SUCCESSFUL')
            // slackSend color: 'good', message: "'${env.JOB_NAME}'  (${env.BUILD_NUMBER}) - Build was successfull", channel: '#hipai'
            // jiraComment(issueKey: "${ISSUE_ID}", body: "Job '${env.JOB_NAME}' (${env.BUILD_NUMBER}) was successful. Please go to ${env.BUILD_URL}.")


        } catch(err) {
                
            bitbucketStatusNotify(buildState: 'FAILED')
            // jiraComment(issueKey: "${ISSUE_ID}",body: "Job '${env.JOB_NAME}' (${env.BUILD_NUMBER}) was failed. Please review ${err}." )
            currentBuild.result = "FAILURE"
            // slackSend color: 'danger', message: "'${env.JOB_NAME}'  (${env.BUILD_NUMBER}) - Build failed. Please review ${err}.", channel: '#hipai'
            print 'error ' + err
            throw err
        } 
    }   
}

@NonCPS
def find(commit_log) {
  print ' commit log : ' + commit_log
  def matcher = (commit_log =~ /([a-zA-Z][a-zA-Z0-9_]+-[1-9][0-9]*)([^.]|\\.[^0-9]|\\.$|$)/)
  return matcher ? matcher[0][1] : null
}