
const SCANNER = /(\.php|\/\.env|\/wp-|wordpress|wlwmanifest|xmlrpc|phpinfo|\/_profiler|\/@fs|\/actuator|elmah\.axd|server-status|telescope|terraform|appsettings|wp-config|client_secrets|\.sql$|web\.config|Jenkinsfile|docker-compose|compose\.ya?ml|\/v2\/_catalog)/i

export default function isScannerPath(path: string): boolean {
    if (path.startsWith("/.") && !path.startsWith("/.well-known/")) return true
    return SCANNER.test(path)
}
