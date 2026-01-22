# Laravel Policies & Gates - Protection Against Vulnerabilities

This document explains how Policies and Gates are implemented in the project for resource protection and vulnerability prevention.

## 📋 Table of Contents

1. [What are Policies and Gates?](#what-are-policies-and-gates)
2. [Implemented Policies](#implemented-policies)
3. [How it works](#how-it-works)
4. [Prevented Vulnerabilities](#prevented-vulnerabilities)
5. [Usage Examples](#usage-examples)
6. [Best Practices](#best-practices)

## 🔐 What are Policies and Gates?

**Policies** are classes that organize authorization logic for a specific model or resource. They allow checking if a user can perform an action on a resource.

**Gates** are closures that define authorization logic for simple actions, without being tied to a specific model.

In this project we use **Policies** to protect:
- Projects
- Tasks
- Resource Allocations
- Users
- Roles

## 🛡️ Implemented Policies

### 1. ProjectPolicy

Protects operations on projects:

- `viewAny()` - Checks if the user can view the list of projects
- `view()` - Checks if the user can view a specific project
- `create()` - Checks if the user can create projects
- `update()` - Checks if the user can update a project
- `delete()` - Checks if the user can delete a project
- `manageMembers()` - Checks if the user can manage project members

**Authorization rules:**
- The user must belong to the same organization as the project
- The user must have the corresponding permission (`projects.view`, `projects.create`, etc.)
- Project members can view the project even if they don't have explicit permission
- Project owners can update the project

### 2. TaskPolicy

Protects operations on tasks:

- `viewAny()` - Checks if the user can view the list of tasks
- `view()` - Checks if the user can view a specific task
- `create()` - Checks if the user can create tasks
- `update()` - Checks if the user can update a task
- `delete()` - Checks if the user can delete a task
- `assign()` - Checks if the user can assign tasks

**Authorization rules:**
- The user must belong to the same organization as the task
- Users assigned to the task can view and update the task
- Project members can view the project's tasks

### 3. ResourceAllocationPolicy

Protects operations on resource allocations:

- `viewAny()` - Checks if the user can view the list of allocations
- `view()` - Checks if the user can view a specific allocation
- `create()` - Checks if the user can create allocations
- `update()` - Checks if the user can update an allocation
- `delete()` - Checks if the user can delete an allocation

**Authorization rules:**
- The user must belong to the same organization as the allocation
- Users can view their own allocations even if they don't have explicit permission

### 4. UserPolicy

Protects operations on users:

- `viewAny()` - Checks if the user can view the list of users
- `view()` - Checks if the user can view a specific user
- `create()` - Checks if the user can invite new users
- `update()` - Checks if the user can update a user
- `delete()` - Checks if the user can delete a user
- `assignRole()` - Checks if the user can assign roles

**Authorization rules:**
- Users can view and update their own data
- Users cannot delete themselves
- Users must belong to the same organization

### 5. RolePolicy

Protects operations on roles:

- `viewAny()` - Checks if the user can view the list of roles
- `view()` - Checks if the user can view a specific role
- `create()` - Checks if the user can create roles
- `update()` - Checks if the user can update a role
- `delete()` - Checks if the user can delete a role
- `assign()` - Checks if the user can assign roles

**Authorization rules:**
- System roles (`is_system = true`) cannot be modified or deleted
- The user must belong to the same organization as the role (or the role must be global)

## 🔄 How it works

### 1. Policy Registration

Policies are registered in `app/Providers/AuthServiceProvider.php`:

```php
protected $policies = [
    Project::class => ProjectPolicy::class,
    Task::class => TaskPolicy::class,
    ResourceAllocation::class => ResourceAllocationPolicy::class,
    User::class => UserPolicy::class,
    Role::class => RolePolicy::class,
];
```

### 2. Usage in Request Classes

Policies are automatically checked in Request classes:

```php
// app/Http/Requests/Project/StoreProjectRequest.php
public function authorize(): bool
{
    return $this->user()->can('create', Project::class);
}

// app/Http/Requests/Project/UpdateProjectRequest.php
public function authorize(): bool
{
    $project = Project::find($this->route('project') ?? $this->route('id'));
    return $project && $this->user()->can('update', $project);
}
```

### 3. Usage in Controllers

Policies are explicitly checked in controllers for additional protection:

```php
// app/Http/Controllers/Api/V1/ProjectController.php
public function show(int $id)
{
    $project = $this->projectService->find($id);
    
    if (! $project) {
        return $this->error('Project not found', 404);
    }
    
    $this->authorize('view', $project);
    
    return $this->success($project, 'Project retrieved successfully');
}
```

## 🚨 Prevented Vulnerabilities

### 1. **IDOR (Insecure Direct Object Reference)**

**Problem:** Users could access resources that don't belong to them by manipulating IDs.

**Solution:** Policies check if the user belongs to the same organization as the resource:

```php
// ProjectPolicy::view()
if ($project->organization_id !== $user->current_organization_id) {
    return false;
}
```

### 2. **Privilege Escalation**

**Problem:** Users could attempt to gain access to functions for which they don't have permissions.

**Solution:** Policies check the user's permissions in the organization:

```php
protected function hasPermission(User $user, string $permission): bool
{
    $organizationId = $user->current_organization_id;
    if (! $organizationId) {
        return false;
    }
    return $user->hasPermissionInOrganization($permission, $organizationId);
}
```

### 3. **Cross-Tenant Data Access**

**Problem:** Users from one organization could access data from other organizations.

**Solution:** All Policies verify that the resource belongs to the user's current organization.

### 4. **Unauthorized Actions**

**Problem:** Users could perform actions for which they don't have permissions.

**Solution:** Each action (create, update, delete) is checked through Policies.

## 📝 Usage Examples

### Check in Controller

```php
public function destroy(int $id)
{
    $project = $this->projectService->find($id);
    
    if (! $project) {
        return $this->error('Project not found', 404);
    }
    
    // Check if the user can delete the project
    $this->authorize('delete', $project);
    
    $deleted = $this->projectService->delete($id);
    
    return $this->success(null, 'Project deleted successfully');
}
```

### Check in Request

```php
public function authorize(): bool
{
    $project = Project::find($this->route('project'));
    return $project && $this->user()->can('update', $project);
}
```

### Manual Check

```php
if ($user->can('view', $project)) {
    // User can view the project
}

if ($user->cannot('delete', $task)) {
    abort(403, 'Unauthorized action');
}
```

## ✅ Best Practices

1. **Double Check:** Policies are checked both in Request classes and Controllers for maximum protection.

2. **Organization Check:** All Policies verify that the resource belongs to the user's organization.

3. **Granular Permissions:** Each action has its own permission (`projects.view`, `projects.create`, etc.).

4. **Fallback to Ownership:** Users can access resources if they are owners or members, even if they don't have explicit permission.

5. **Clear Messages:** Authorization errors return clear messages for debugging.

## 🔍 Permission Check

The `hasPermissionInOrganization()` method in the User model checks if the user has a permission in an organization:

```php
$user->hasPermissionInOrganization('projects.create', $organizationId);
```

This method:
1. Gets the user's roles in the organization
2. Checks if any of the roles has the requested permission
3. Returns `true` if it finds the permission, `false` otherwise

## 📚 Resources

- [Laravel Authorization Documentation](https://laravel.com/docs/authorization)
- [Laravel Policies](https://laravel.com/docs/authorization#creating-policies)
- [Laravel Gates](https://laravel.com/docs/authorization#gates)
