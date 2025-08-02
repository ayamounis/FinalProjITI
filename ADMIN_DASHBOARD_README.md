# Admin Dashboard for Print-on-Demand Platform

## Overview

The Admin Dashboard is a comprehensive management interface for administrators to manage users and product templates in the print-on-demand platform.

## Features

### User Management

- **View All Users**: Display a comprehensive list of all registered users
- **Search Users**: Real-time search functionality to find specific users
- **Edit Users**: Update user information (first name, last name, email)
- **Delete Users**: Remove users from the system with confirmation
- **User Status**: View email confirmation status and account details

### Product Template Management

- **View All Templates**: Display all product templates in a grid layout
- **Search Templates**: Search templates by name or description
- **Add Templates**: Create new product templates with full details
- **Edit Templates**: Modify existing template information
- **Delete Templates**: Remove templates with confirmation
- **Template Status**: View active/inactive status and creation dates

## Access Control

- **Admin Role Required**: Only users with "Admin" role can access the dashboard
- **Route Protection**: Admin routes are protected by `adminGuard`
- **Authentication**: All API requests include JWT authentication token

## API Endpoints Used

### User Management

- `GET /api/Admin/Users` - Get all users
- `GET /api/Admin/Users/{id}` - Get specific user
- `PUT /api/Admin/Users/{id}` - Update user
- `DELETE /api/Admin/Users/{id}` - Delete user

### Product Template Management

- `GET /api/Admin/Templates` - Get all templates
- `GET /api/Admin/Templates/{id}` - Get specific template
- `POST /api/Admin/Templates` - Create new template
- `PUT /api/Admin/Templates/{id}` - Update template
- `DELETE /api/Admin/Templates/{id}` - Delete template

## UI Features

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern Interface**: Clean, professional design matching the platform's style
- **Loading States**: Visual feedback during API operations
- **Modal Forms**: Intuitive forms for editing and creating items
- **Search & Filter**: Real-time search functionality
- **Status Indicators**: Clear visual status badges for users and templates

## Navigation

- **Tab Navigation**: Switch between Users and Templates management
- **Admin Link**: Available in navbar for admin users only
- **Breadcrumb**: Clear navigation path

## Security

- **Role-based Access**: Only admin users can access
- **Token Authentication**: JWT tokens automatically included in requests
- **Route Guards**: Protection against unauthorized access
- **Confirmation Dialogs**: Prevent accidental deletions

## Technical Implementation

- **Angular 17**: Built with latest Angular features
- **Standalone Components**: Modern Angular architecture
- **Reactive Forms**: Form validation and handling
- **HTTP Interceptors**: Automatic token inclusion
- **TypeScript**: Full type safety
- **CSS Variables**: Consistent theming

## Usage Instructions

1. **Login as Admin**: Ensure you have admin role assigned
2. **Access Dashboard**: Click "Admin Dashboard" in the navbar
3. **Manage Users**:
   - View all users in the table
   - Search for specific users
   - Click edit/delete buttons for actions
4. **Manage Templates**:
   - View templates in grid layout
   - Click "Add Template" to create new ones
   - Hover over templates to see edit/delete options
5. **Form Operations**:
   - Fill required fields in modals
   - Submit forms to save changes
   - Cancel to close without saving

## File Structure

```
src/app/
├── admin-dashboard/
│   ├── admin-dashboard.component.ts
│   ├── admin-dashboard.component.html
│   ├── admin-dashboard.component.css
│   └── admin-dashboard.component.spec.ts
├── interfaces/
│   └── admin.interface.ts
├── admin.service.ts
├── admin.service.spec.ts
├── admin.guard.ts
└── auth.interceptor.ts
```

## Dependencies

- Angular Forms (ReactiveFormsModule, FormsModule)
- Angular Common (CommonModule)
- Angular Router
- Angular HTTP Client
- Font Awesome Icons (for UI elements)
