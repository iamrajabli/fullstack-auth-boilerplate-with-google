import { UserRole } from './user/user.interface';

interface RequestUser {
	_id: string;
	email: string;
	role: UserRole;
}

declare global {
	namespace Express {
		interface Request {
			authUser: RequestUser;
		}
	}
}
