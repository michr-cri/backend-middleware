When this module is added as middleware to any nodejs http server it intercepts http requests and returns responses configured by the user. e.g.: Your beautiful js UI application is asking for list of employees by making a call to https://mycompany.com/services/employee/1223. In that case you application will need to be able to access the backend identified by that url. However by using this module as middleware for your nodejs http server you can tell http(s)://localhost:<your port>/backend/middleware/employee/1223 to return any response you like and point your local dev environment to call you localhost instead without having to have a full blown up backend server. That would greatly simplify your life when making demos and going over design discussions.

The context path when making calls to the mocked backend should be specified as /backend-middleware. This is not configurable yet.

!!When you are writing resource url param map files, you should pay attention to map the url param "resourceId" to the object identifier attribute of your resource json representation. If you need to specify another url parameter that you'd like to use with query string for that resource you can add that to the mapping as well without problems. However, resourceId url param name is used by default route handlers so unless those are overridden you should provide a mapping for "resourceId" no matter whatever else you'd like to use for resource id param name.