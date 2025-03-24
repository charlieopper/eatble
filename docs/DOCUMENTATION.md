# eatABLE - Allergy-Friendly Restaurant Reviews

Last Updated: 2025-03-24

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Core Features](#core-features)
4. [Component Structure](#component-structure)
5. [Authentication System](#authentication-system)
6. [UI Components](#ui-components)
7. [Navigation](#navigation)
8. [State Management](#state-management)
9. [Current Limitations](#current-limitations)
10. [Planned Features](#planned-features)
11. [Recent Updates](#recent-updates)

## Project Overview

eatABLE is a web application designed to help users with food allergies find safe dining options. Users can search for restaurants, read and write reviews, and manage their allergen preferences.

## Tech Stack

- Frontend: React.js
- Authentication: Firebase Auth
- Database: Firebase (planned)
- Styling: Custom CSS-in-JS

## Core Features

### 1. Navigation System

- Bottom navigation bar with four main sections:
  - Home (Search)
  - Reviews
  - Favorites
  - Profile
- Persistent across all pages
- Active page indication

### 2. Authentication

- Email/Password login
- Social login (Google, Facebook)
- Registration with allergen preferences
- Protected routes for authenticated features

### 3. Search Functionality

- Location-based search
- Optional restaurant name filter
- Distance filter
- Allergen filtering

### 4. User Profile

- Allergen preferences management
- Review history
- Account settings

## Component Structure

### Pages

1. HomePage (`src/pages/HomePage.jsx`)

   - Search interface
   - Allergen selection
   - Authentication modals

2. SearchPage (`src/pages/SearchPage.jsx`)

   - Results display
   - Filtering options

3. ReviewsPage (`src/pages/ReviewsPage.jsx`)

   - Review listing
   - Review creation interface

4. ProfilePage (`src/pages/ProfilePage.jsx`)
   - User information
   - Preferences management
   - Authentication state handling
   - Favorites management
   - Firestore data integration

### Auth Components

1. LoginModal (`src/components/auth/LoginModal.jsx`)

   - Email/password login
   - Social login options
   - Error handling
   - Loading states

2. RegisterModal (`src/components/auth/RegisterModal.jsx`)
   - User registration
   - Allergen selection
   - Form validation

### Layout Components

1. Footer (`src/components/layout/Footer.jsx`)
   - Bottom navigation
   - Active page tracking

### UI Elements

1. AllergenSelector (`src/components/allergens/AllergenSelector.jsx`)
   - Grid layout
   - Toggle functionality
   - Visual feedback

## Authentication System

- Firebase Authentication integration
- Session management
- Protected routes
- Social login providers:
  - Google
  - Facebook

## UI Components

### Modals

- Consistent styling
- Close button
- Overlay background
- Mobile-responsive design

### Forms

- Input validation
- Error messaging
- Loading states
- Responsive layouts

### Navigation

- Bottom navigation bar
- Icon-based navigation
- Active state indication

## State Management

- useState for component-level state
- useContext for auth state and favorites
- Custom hooks for shared logic
- Firestore for persistent data storage

## Current Limitations

1. Limited error handling
2. Basic form validation
3. Performance optimization needed for large datasets

## Planned Features

1. API Integration
2. Enhanced error handling
3. User preferences persistence
4. Review management system
5. Restaurant data integration
6. Advanced search filters
7. User profile images
8. Review ratings system

## Recent Updates

### Favorites System (March 2024)

- Implemented FavoritesContext for global favorites state management
- Added Firestore integration for persistent favorites storage
- Created optimistic UI updates for better user experience
- Implemented proper error handling with fallbacks

### Review System Improvements

- Added support for multiple reviews per restaurant
- Implemented "helpful" voting system for reviews
- Created utility for selecting most helpful reviews
- Enhanced review display with user information and dates

### ProfilePage Enhancements

- Added local state management for favorites to prevent UI flashing
- Enhanced Firestore data fetching with proper error handling
- Fixed review data formatting for RestaurantCard components
- Improved user experience by preventing unnecessary error toasts

### Data Flow Architecture

The favorites and reviews system now follows this data flow:

1. **Context Providers**: Manage global state and Firebase interactions
2. **Page Components**: Enrich data with additional Firestore information
3. **UI Components**: Display formatted data with proper fallbacks
4. **Utility Functions**: Handle data transformation and selection logic

---

Note: This documentation will be updated as new features are added or existing ones are modified.
