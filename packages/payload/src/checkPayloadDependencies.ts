import { checkDependencies } from './utilities/dependencies/dependencyChecker.js'
import { CMS_PACKAGE_LIST } from './versions/payloadPackageList.js'

export function checkCMSDependencies() {
  const dependencies = [...CMS_PACKAGE_LIST]

  if (process.env.CMS_CI_DEPENDENCY_CHECKER !== 'true') {
    dependencies.push('@hanzo/cms-plugin-sentry')
  }

  // First load. First check if there are mismatching dependency versions of cms packages
  void checkDependencies({
    dependencyGroups: [
      {
        name: 'cms',
        dependencies,
        targetVersionDependency: 'payload',
      },
    ],
  })
}
