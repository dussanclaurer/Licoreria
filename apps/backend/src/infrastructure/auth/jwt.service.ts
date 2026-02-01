import jwt from 'jsonwebtoken';

export class JwtService {
    private readonly secret: string;

    constructor(secret: string) {
        this.secret = secret;
    }

    sign(payload: object): string {
        return jwt.sign(payload, this.secret, { expiresIn: '8h' });
    }

    verify(token: string): any {
        try {
            return jwt.verify(token, this.secret);
        } catch {
            return null;
        }
    }
}
