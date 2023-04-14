import ServiceKey from "@/middleware/ServiceKey";
import CourseService from "@/api/CourseService";
import AcademicService from "@/api/AcademicService";
import TestService from "@/api/TestService";
import LogsService from "@/api/LogsService";

export default function (app) {
    app.use("/test", TestService);
    app.use("/logs", LogsService);
    app.use("/api/course-service/v1/course", ServiceKey, CourseService);
    app.use("/api/course-service/v1/academic", ServiceKey, AcademicService);
}
