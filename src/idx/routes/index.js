import HomeRoute from './HomeRoute';
import DocsRoute from './DocsRoute';
import StudioRoute from './StudioRoute';
import SettingsRoute from './SettingsRoute';
import TestSuiteRoute from './TestSuiteRoute';

const routes = {
    "/": HomeRoute,
    "/studio": StudioRoute,
    "/docs": DocsRoute,
    "/testsuite": TestSuiteRoute,
    "/settings": SettingsRoute
}

export default routes;