<?php

return [
    /*
    |--------------------------------------------------------------------------
    | RBAC Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for the role and permission system (RBAC)
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Default Roles
    |--------------------------------------------------------------------------
    |
    | Default roles created for each new organization
    |
    */

    'default_roles' => [
        'admin' => [
            'name' => 'Administrator',
            'slug' => 'admin',
            'description' => 'Full access to all features',
            'is_system' => true,
        ],
        'project_manager' => [
            'name' => 'Project Manager',
            'slug' => 'project_manager',
            'description' => 'Can manage projects and resources',
            'is_system' => true,
        ],
        'developer' => [
            'name' => 'Developer',
            'slug' => 'developer',
            'description' => 'Can work on assigned tasks',
            'is_system' => true,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Permission Groups
    |--------------------------------------------------------------------------
    |
    | Permission groups for organization
    |
    */

    'permission_groups' => [
        'organizations' => 'Organizations',
        'projects' => 'Projects',
        'tasks' => 'Tasks',
        'resources' => 'Resources',
        'users' => 'Users',
        'roles' => 'Roles & Permissions',
    ],

    /*
    |--------------------------------------------------------------------------
    | Default Permissions
    |--------------------------------------------------------------------------
    |
    | Default permissions created in the system
    |
    */

    'default_permissions' => [
        // Organizations
        'organizations.view',
        'organizations.create',
        'organizations.update',
        'organizations.delete',

        // Projects
        'projects.view',
        'projects.create',
        'projects.update',
        'projects.delete',
        'projects.manage_members',

        // Tasks
        'tasks.view',
        'tasks.create',
        'tasks.update',
        'tasks.delete',
        'tasks.assign',

        // Resources
        'resources.view',
        'resources.allocate',
        'resources.update_allocation',

        // Users
        'users.view',
        'users.invite',
        'users.update',
        'users.remove',

        // Roles
        'roles.view',
        'roles.create',
        'roles.update',
        'roles.delete',
        'roles.assign',
    ],
];
