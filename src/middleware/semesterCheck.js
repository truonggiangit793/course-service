import jsonResponse from "@/utils/json";
import semesterSchema from "@/schema/academic";

export default function (req, res, next) {
    // return next();
    const semesterAlias = req.body.semesterAlias || req.params.semesterAlias;
    if (!semesterAlias)
        return jsonResponse({ req, res }).failed({ statusCode: 200, message: "semesterAlias must be provided." });
    const { error } = semesterSchema.validate(semesterAlias);
    if (error) return next(error);
    semesterModel.findOneByAlias({ alias: semesterAlias }, (err, semester) => {
        if (err) return next(err);
        if (!semester.status) {
            return jsonResponse({ req, res }).failed({
                statusCode: 200,
                message: `Semester ${semesterAlias} has been closed .`,
            });
        } else {
            return next();
        }
    });
}
