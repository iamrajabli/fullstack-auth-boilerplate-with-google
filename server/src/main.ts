import { Container, ContainerModule, interfaces } from 'inversify';
import { App } from './app';
import { TYPES } from '@/common/TYPES';
import { LoggerServiceInterface } from './logger/logger.interface';
import { ExceptionFilterInterface } from './errors/exception-filter.interface';
import { ConfigServiceInterface } from './config/config.interface';
import { ConfigService } from './config/config.service';
import { LoggerService } from './logger/logger.service';
import { ExceptionFilter } from './errors/exception-filter';
import { MongooseServiceInterface } from './db/db.interface';
import { MongooseService } from './db/db.service';
import { UserService } from './user/user.service';
import { UserController } from './user/user.controller';
import {
	UserControllerInterface,
	UserServiceInterface,
} from './user/user.interface';

export interface IBootstrapReturn {
	appContainer: Container;
	app: App;
}

const appBindings = new ContainerModule((bind: interfaces.Bind) => {
	bind<LoggerServiceInterface>(TYPES.LoggerInterface).to(LoggerService);
	bind<ExceptionFilterInterface>(TYPES.ExceptionFilterInterface).to(
		ExceptionFilter,
	);
	bind<ConfigServiceInterface>(TYPES.ConfigServiceInterface)
		.to(ConfigService)
		.inSingletonScope();
	bind<MongooseServiceInterface>(TYPES.MongooseServiceInterface).to(
		MongooseService,
	);
	bind<UserServiceInterface>(TYPES.UserServiceInterface).to(UserService);
	bind<UserControllerInterface>(TYPES.UserControllerInterface).to(
		UserController,
	);

	bind<App>(TYPES.Application).to(App);
});

function bootstrap(): IBootstrapReturn {
	const appContainer = new Container();
	appContainer.load(appBindings);

	const app = appContainer.get<App>(TYPES.Application);
	app.init();

	return { appContainer, app };
}

export const { appContainer, app } = bootstrap();
