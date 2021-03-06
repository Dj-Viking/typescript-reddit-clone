import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { Request, Response } from 'express';
import { Session, SessionData } from 'express-session';
import { Redis } from 'ioredis';

//update since the video was made...
/**
 * declare global {
    namespace Express {
        // Inject additional properties on express.Request
        interface Request {
            /**
             * This request's `Session` object.
             * Even though this property isn't marked as optional, it won't exist until you use the `express-session` middleware
             * [Declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html) can be used to add your own properties.
             *
             * @see SessionData
             *
            session: session.Session & Partial<session.SessionData>;

            /**
             * This request's session ID.
             * Even though this property isn't marked as optional, it won't exist until you use the `express-session` middleware
             *
            sessionID: string;
        }
    }
}
/**/
// & sign in typescript joins types together (intersection)
// | sign in typescript gives the option for the type to be either one type or another (union)

export type MyContext = {
    em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>
    //performing an interesection so we can make req.session.userId 
    //req.session.welcomeBackMsg and req.session.username available to be assigned
    // new values on the req.session object
    req: Request & {
        session: Session & Partial<SessionData> & {
            userId?: number
        } & { 
            welcomeBackMsg?: String 
        } & { 
            username?: String 
        }
    }
    res: Response
    RedisClient: Redis
}