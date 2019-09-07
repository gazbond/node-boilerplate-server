## DIRECTORY STRUCTURE

      config/       config files for testing and development environments
      controllers/  public and api http controllers classes
      emails/       email templates
      library/      base classes and helpers
      migrations/   relational database migrations
      models/       relational database models with search index mappings
      seeds/        relational database and search indexes data
      tests/        unit, api and acceptance tests
      views/        html templates
      ./            configs for cli libraries (knex, gulp, codecept), server and app js files etc.

## ENDPOINTS

      security/login
      security/resend
      security/recover
      security/confirm
      security/password
      users (RESTful)
      users/me
      users/:id/role
      users/:id/role/:name
      roles/ (RESTful)
      roles/:id/permission
      roles/:id/permission/:name
      permissions/ (RESTful)

## GULP FILE

```
# delete and recreate indexes (default)
npm run gulp:indices
# or
npm run gulp setup_indices
# or
npm run gulp
```

```
# delete indexes
npm run gulp delete_indices
```

```
# create indexes
npm run gulp create_indices
```

```
# apply data mappings to indexes
npm run gulp put_mappings
```

```
# re-index all data
npm run gulp re_index
```

```
# read a data model and print elasticsearch mappings for its properties
# useful for default indexMappings()
npm run gulp elastic_model
```