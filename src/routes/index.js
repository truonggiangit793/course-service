import ServiceKey from "@/middleware/ServiceKey";
import CourseService from "@/api/CourseService";
import AcademicService from "@/api/AcademicService";
import TestService from "@/api/TestService";
import LogsService from "@/api/LogsService";
import ScheduleService from "@/api/ScheduleService";
import SemesterService from "@/api/SemesterService";

export default function (app) {
    app.use("/test", TestService);
    app.use("/logs", LogsService);
    app.use("/api/course-service/v1/course", ServiceKey, CourseService);
    app.use("/api/course-service/v1/semester", ServiceKey, SemesterService);
    app.use("/api/course-service/v1/academic", ServiceKey, AcademicService);
    app.use("/api/course-service/v1/schedule", ServiceKey, ScheduleService);
}
