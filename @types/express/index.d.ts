declare global {
  namespace Express {
    interface Request {
      verifiedAccessToken: string
    }
  }
}
