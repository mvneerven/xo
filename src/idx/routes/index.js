import HomeRoute from './HomeRoute';
import DocsRoute from './DocsRoute';
import StudioRoute from './StudioRoute';
import SettingsRoute from './SettingsRoute';

const routes = {
    "/": HomeRoute,
    "/studio": StudioRoute,
    "/docs": DocsRoute,
    "/settings": SettingsRoute
}

export default routes;