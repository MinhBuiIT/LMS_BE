export interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

export interface VerificationBody {
  code: number;
  token: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface RefreshTokenBody {
  refreshToken: string;
}
