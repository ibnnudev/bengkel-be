import express, {
    type NextFunction,
    type Request,
    type Response,
} from "express";
import sosRoute from "./modules/sos/sos.route";
import cors from "cors";
import { httpLogger } from "./middleware/logger";
import { sendError } from "./helper/response.helper";
import { AppError } from "./error/app.error";

const app = express();

app.use(httpLogger);
app.use(express.json());
app.use(cors());

app.use("/sos", sosRoute);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof AppError) {
        return sendError(res, err.message, err.statusCode);
    }

    return sendError(
        res,
        "Internal Server Error",
        500,
        err instanceof Error ? err.message : err,
    );
});

export default app;
