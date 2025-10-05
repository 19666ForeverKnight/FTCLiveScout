import { account } from './appwrite';
import { ID, Models } from 'appwrite';

export interface SignupData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

/**
 * Create a new user account
 */
export async function signup(data: SignupData): Promise<Models.User<Models.Preferences>> {
  try {
    const user = await account.create(
      ID.unique(),
      data.email,
      data.password,
      data.name
    );
    
    // Automatically log in the user after signup
    await login({ email: data.email, password: data.password });
    
    return user;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
}

/**
 * Log in an existing user
 */
export async function login(data: LoginData): Promise<Models.Session> {
  try {
    const session = await account.createEmailPasswordSession(
      data.email,
      data.password
    );
    return session;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Log out the current user
 */
export async function logout(): Promise<void> {
  try {
    await account.deleteSession('current');
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

/**
 * Get the current logged-in user
 */
export async function getCurrentUser(): Promise<Models.User<Models.Preferences> | null> {
  try {
    const user = await account.get();
    return user;
  } catch (error) {
    // User is not logged in
    return null;
  }
}

/**
 * Check if a user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    await account.get();
    return true;
  } catch (error) {
    return false;
  }
}
