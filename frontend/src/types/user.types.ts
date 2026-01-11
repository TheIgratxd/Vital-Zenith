export interface UserInfo {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  metadata: {
    creationTime: string;
    lastSignInTime: string;
  };
}

export interface AuthResponse {
  message: string;
  user: {
    uid: string;
    email?: string;
    [key: string]: any;
  };
}
