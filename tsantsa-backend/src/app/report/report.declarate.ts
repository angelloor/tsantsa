import { getFullDate } from '../../utils/date';
import { generateImage2B64 } from '../../utils/global';
import { Assistance } from '../business/assistance/assistance.class';
import { Career } from '../business/career/career.class';
import { Course } from '../business/course/course.class';
import { Enrollment } from '../business/enrollment/enrollment.class';
import { Period } from '../business/period/period.class';
import { Task } from '../business/task/task.class';
import { UserTask } from '../business/user_task/user_task.class';
/**
 * reportPeriod
 * @param periods
 * @returns
 */
export const reportPeriod = async (periods: Period[]) => {
	return new Promise<string>(async (resolve, reject) => {
		const generateRow = (periods: Period[]) => {
			let result: string = '';

			periods.map((item: Period, index: number) => {
				result += `<tr>
								<td>${index + 1}</td>
								<td>${item.name_period}</td>
								<td>${getFullDate(item.start_date_period!).day}-${
					getFullDate(item.start_date_period!).month
				}-${getFullDate(item.start_date_period!).fullYear}</td>
								<td>${getFullDate(item.end_date_period!).day}-${
					getFullDate(item.end_date_period!).month
				}-${getFullDate(item.end_date_period!).fullYear}</td>
								<td>${item.approval_note_period}/${item.maximum_rating}</td>
							</tr>
						`;
			});
			return result;
		};

		const html: string = `<!DOCTYPE html>
		<html>
		
		<head>
			<meta charset="UTF-8">
			${STYLES}
		</head>
		<body>
			<div class="reporte">
				${await generateHeader('Reporte de periodos')}
				<div class="containerBody">
					<div class="title">
						<h2>Periodos</h2>
					</div>
					<table class="tableInst">
						<thead>
							<tr>
								<td>#</td>
								<td>Nombre</td>
								<td>Fecha de inicio</td>
								<td>Fecha de finalización</td>
								<td>Nota de aprovación</td>
							</tr>
						</thead>
						<tbody>
						${periods.length > 0 ? `${generateRow(periods)}` : ''}		
						</tbody>
					</table>
				</div>
			</div>
		</body>
		
		</html>`;
		resolve(html);
	});
};
/**
 * reportCareer
 * @param careers
 * @returns
 */
export const reportCareer = async (careers: Career[]) => {
	return new Promise<string>(async (resolve, reject) => {
		const generateRow = (careers: Career[]) => {
			let result: string = '';

			careers.map((item: Career, index: number) => {
				result += `<tr>
								<td>${index + 1}</td>
								<td>${item.name_career}</td>
								<td>${item.description_career}</td>
								<td>${item.status_career ? 'Activa' : 'Inactiva'}</td>
								<td>${getFullDate(item.creation_date_career!).day}-${
					getFullDate(item.creation_date_career!).month
				}-${getFullDate(item.creation_date_career!).fullYear} ${
					getFullDate(item.creation_date_career!).hours
				}:${getFullDate(item.creation_date_career!).minutes}:${
					getFullDate(item.creation_date_career!).seconds
				}</td>
							</tr>
						`;
			});
			return result;
		};

		const html: string = `<!DOCTYPE html>
		<html>
		
		<head>
			<meta charset="UTF-8">
			${STYLES}
		</head>
		<body>
			<div class="reporte">
				${await generateHeader('Reporte de cursos')}
				<div class="containerBody">
					<div class="title">
						<h2>Cursos</h2>
					</div>
					<table class="tableInst">
						<thead>
							<tr>
								<td>#</td>
								<td>Nombre</td>
								<td>Descripción</td>
								<td>Estado</td>
								<td>Fecha de creación</td>
							</tr>
						</thead>
						<tbody>
						${careers.length > 0 ? `${generateRow(careers)}` : ''}		
						</tbody>
					</table>
				</div>
			</div>
		</body>
		
		</html>`;
		resolve(html);
	});
};
/**
 * reportCourseByPeriod
 * @param courses
 * @returns
 */
export const reportCourseByPeriod = async (courses: Course[]) => {
	return new Promise<string>(async (resolve, reject) => {
		const generateRow = (courses: Course[]) => {
			let result: string = '';

			courses.map((item: Course, index: number) => {
				result += `<tr>
								<td>${index + 1}</td>
								<td>${item.name_course}</td>
								<td>${item.description_course}</td>
								<td>${item.status_course ? 'Activo' : 'Inactivo'}</td>
								<td>${getFullDate(item.creation_date_course!).day}-${
					getFullDate(item.creation_date_course!).month
				}-${getFullDate(item.creation_date_course!).fullYear} ${
					getFullDate(item.creation_date_course!).hours
				}:${getFullDate(item.creation_date_course!).minutes}:${
					getFullDate(item.creation_date_course!).seconds
				}</</td>
							</tr>
						`;
			});
			return result;
		};

		const html: string = `<!DOCTYPE html>
		<html>
		
		<head>
			<meta charset="UTF-8">
			${STYLES}
		</head>
		<body>
			<div class="reporte">
				${await generateHeader('Reporte de asignaturas')}
				<div class="containerBody">
					<div class="title">
						<h2>Periodo: ${
							courses.length > 0 ? `${courses[0].period.name_period}` : ''
						}</h2>
						<h2>Asignaturas</h2>
					</div>
					<table class="tableInst">
						<thead>
							<tr>
								<td>#</td>
								<td>Nombre</td>
								<td>Descripción</td>
								<td>Estado</td>
								<td>Fecha de creación</td>
							</tr>
						</thead>
						<tbody>
						${courses.length > 0 ? `${generateRow(courses)}` : ''}		
						</tbody>
					</table>
				</div>
			</div>
		</body>
		
		</html>`;
		resolve(html);
	});
};
/**
 * reportEnrollmentByCourse
 * @param enrollment
 * @returns
 */
export const reportEnrollmentByCourse = async (enrollments: Enrollment[]) => {
	return new Promise<string>(async (resolve, reject) => {
		const generateRow = (enrollments: Enrollment[]) => {
			let result: string = '';

			enrollments.map((item: Enrollment, index: number) => {
				result += `<tr>
								<td>${index + 1}</td>
								<td>${item.user.person.name_person} ${item.user.person.last_name_person}</td>
								<td>${item.status_enrollment ? 'Activo' : 'Inactivo'}</td>
								<td>${getFullDate(item.date_enrollment!).day}-${
					getFullDate(item.date_enrollment!).month
				}-${getFullDate(item.date_enrollment!).fullYear}  ${
					getFullDate(item.date_enrollment!).hours
				}:${getFullDate(item.date_enrollment!).minutes}:${
					getFullDate(item.date_enrollment!).seconds
				}</td>
								<td>${
									item.completed_course
										? 'Asignatura finalizada'
										: 'Asignatura en marcha'
								}</td>
							</tr>
						`;
			});
			return result;
		};

		const html: string = `<!DOCTYPE html>
		<html>
		
		<head>
			<meta charset="UTF-8">
			${STYLES}
		</head>
		<body>
			<div class="reporte">
				${await generateHeader('Reporte de matrículas')}
				<div class="containerBody">
					<div class="title">
						<h2>Asignatura: ${
							enrollments.length > 0
								? `${enrollments[0].course.name_course}`
								: ''
						}</h2>
						<h2>Matrículas</h2>
					</div>
					<table class="tableInst">
						<thead>
							<tr>
								<td>#</td>
								<td>Estudiante</td>
								<td>Estado</td>
								<td>Fecha de la matrícula</td>
								<td>Estado de la asignatura</td>
							</tr>
						</thead>
						<tbody>
						${enrollments.length > 0 ? `${generateRow(enrollments)}` : ''}		
						</tbody>
					</table>
				</div>
			</div>
		</body>
		
		</html>`;
		resolve(html);
	});
};
/**
 * reportTaskByCourse
 * @param tasks
 * @returns
 */
export const reportTaskByCourse = async (tasks: Task[]) => {
	return new Promise<string>(async (resolve, reject) => {
		const generateRow = (tasks: Task[]) => {
			let result: string = '';

			tasks.map((item: Task, index: number) => {
				result += `<tr>
								<td>${index + 1}</td>
								<td>${item.name_task}</td>
								<td>${item.description_task}</td>
								<td>${item.status_task ? 'Enviada' : 'Por enviar'}</td>
								<td>${getFullDate(item.limit_date!).day}-${
					getFullDate(item.limit_date!).month
				}-${getFullDate(item.limit_date!).fullYear} ${
					getFullDate(item.limit_date!).hours
				}:${getFullDate(item.limit_date!).minutes}:${
					getFullDate(item.limit_date!).seconds
				}</td>
								<td>${getFullDate(item.creation_date_task!).day}-${
					getFullDate(item.creation_date_task!).month
				}-${getFullDate(item.creation_date_task!).fullYear} ${
					getFullDate(item.creation_date_task!).hours
				}:${getFullDate(item.creation_date_task!).minutes}:${
					getFullDate(item.creation_date_task!).seconds
				}</td>
							</tr>
						`;
			});
			return result;
		};

		const html: string = `<!DOCTYPE html>
		<html>
		
		<head>
			<meta charset="UTF-8">
			${STYLES}
		</head>
		<body>
			<div class="reporte">
				${await generateHeader('Reporte de tareas')}
				<div class="containerBody">
					<div class="title">
						<h2>Asignatura: ${tasks.length > 0 ? `${tasks[0].course.name_course}` : ''}</h2>
						<h2>Tareas</h2>
					</div>
					<table class="tableInst">
						<thead>
							<tr>
								<td>#</td>
								<td>Nombre</td>
								<td>Descripción</td>
								<td>Estado</td>
								<td>Fecha límite de entrega</td>
								<td>Fecha de creación</td>
							</tr>
						</thead>
						<tbody>
						${tasks.length > 0 ? `${generateRow(tasks)}` : ''}		
						</tbody>
					</table>
				</div>
			</div>
		</body>
		
		</html>`;
		resolve(html);
	});
};
/**
 * reportUserTaskByUser
 * @param userTasks
 * @returns
 */
export const reportUserTaskByUser = async (userTasks: UserTask[]) => {
	return new Promise<string>(async (resolve, reject) => {
		let promedio: number = 0;
		let count: number = 0;

		const generateRow = (userTasks: UserTask[]) => {
			let result: string = '';

			userTasks.map((item: UserTask, index: number) => {
				result += `<tr>
								<td>${index + 1}</td>
								<td>${item.task.name_task}</td>
								<td>${item.task.description_task}</td>
								<td>${getFullDate(item.task.limit_date!).day}-${
					getFullDate(item.task.limit_date!).month
				}-${getFullDate(item.task.limit_date!).fullYear}</td>
								<td>${getFullDate(item.shipping_date_user_task!).day}-${
					getFullDate(item.shipping_date_user_task!).month
				}-${getFullDate(item.shipping_date_user_task!).fullYear}</td>
								<td>${
									item.qualification_user_task
										? item.qualification_user_task
										: 'Sin calificar'
								}</td>
							</tr>
						`;
				count += 1;
				promedio += item.qualification_user_task
					? parseInt(item.qualification_user_task.toString())
					: 0;
			});

			return result;
		};

		const html: string = `<!DOCTYPE html>
		<html>
		
		<head>
			<meta charset="UTF-8">
			${STYLES}
		</head>
		<body>
			<div class="reporte">
				${await generateHeader('Reporte de notas')}
				<div class="containerBody">
					<div class="title">
						<h2><strong>Estudiante:</strong> ${
							userTasks.length > 0
								? `${userTasks[0].user.person.name_person} ${userTasks[0].user.person.last_name_person}`
								: ''
						}</h2>
						<h2><strong>Asignatura:</strong> ${
							userTasks.length > 0
								? `${userTasks[0].task.course.name_course}`
								: ''
						}</h2>
						<h2><strong>Parcial:</strong> ${
							userTasks.length > 0
								? `${userTasks[0].task.partial.name_partial}`
								: ''
						}</h2>
						<h2>Notas</h2>
					</div>
					<table class="tableInst">
						<thead>
							<tr>
								<td>#</td>
								<td>Nombre</td>
								<td>Descripción</td>
								<td>Fecha límite de entrega</td>
								<td>Fecha de entrega</td>
								<td>Calificación</td>
							</tr>
						</thead>
						<tbody>
						${userTasks.length > 0 ? `${generateRow(userTasks)}` : ''}	
						<tr><td></td></tr>
						<tr><td></td></tr>
						<tr><td></td></tr>
						<tr><td></td></tr>
						<tr><td></td></tr>
						<tr><td></td></tr>
						<tr>
							<td></td>
							<td></td>
							<td></td>
							<td></td>
							<td><strong>Promedio del Parcial</strong></td>
							<td>${promedio / count}</td>
						</tr>
						</tbody>
					</table>
				</div>
			</div>
		</body>
		
		</html>`;
		resolve(html);
	});
};
/**
 * reportAssistanceByUserAndCourse
 * @param tasks
 * @returns
 */
export const reportAssistanceByUserAndCourse = async (
	assistances: Assistance[]
) => {
	return new Promise<string>(async (resolve, reject) => {
		const generateRow = (assistances: Assistance[]) => {
			let result: string = '';

			let nowDate = `${getFullDate(new Date().toDateString()).fullYear}-${
				getFullDate(new Date().toDateString()).month
			}-${getFullDate(new Date().toDateString()).day}`;

			assistances.map((item: Assistance, index: number) => {
				let _dateStartDateSchedule = getFullDate(
					`${nowDate}T${item.course.schedule.start_date_schedule!}`
				);

				let _dateEndDateSchedule = getFullDate(
					`${nowDate}T${item.course.schedule.end_date_schedule!}`
				);

				result += `<tr>
								<td>${index + 1}</td>
								<td>${item.course.name_course}</td>
								<td>${_dateStartDateSchedule.hours}:${_dateStartDateSchedule.minutes}</td>
								<td>${getFullDate(item.start_marking_date!).day}-${
					getFullDate(item.start_marking_date!).month
				}-${getFullDate(item.start_marking_date!).fullYear} ${
					getFullDate(item.start_marking_date!).hours
				}:${getFullDate(item.start_marking_date!).minutes}:${
					getFullDate(item.start_marking_date!).seconds
				}</td>
								<td>${_dateEndDateSchedule.hours}:${_dateEndDateSchedule.minutes}</td>				
								<td>${
									item.end_marking_date == null
										? 'No registra marcación'
										: `${getFullDate(item.end_marking_date!).day}-${
												getFullDate(item.end_marking_date!).month
										  }-${getFullDate(item.end_marking_date!).fullYear} ${
												getFullDate(item.end_marking_date!).hours
										  }:${getFullDate(item.end_marking_date!).minutes}:${
												getFullDate(item.end_marking_date!).seconds
										  }`
								}</td>
								<td>${item.is_late ? 'Atraso' : 'A tiempo'}</td>

							</tr>
						`;
			});
			return result;
		};

		const html: string = `<!DOCTYPE html>
		<html>
		
		<head>
			<meta charset="UTF-8">
			${STYLES}
		</head>
		<body>
			<div class="reporte">
				${await generateHeader('Reporte de asistencia')}
				<div class="containerBody">
					<div class="title">
						<h2>Estudiante: ${
							assistances.length > 0
								? `${assistances[0].user.person.name_person} ${assistances[0].user.person.last_name_person}`
								: ''
						}</h2>
						<h2>Asignatura: ${
							assistances.length > 0
								? `${assistances[0].course.name_course}`
								: ''
						}</h2>
						<h2>Asistencia</h2>
					</div>
					<table class="tableInst">
						<thead>
							<tr>
								<td>#</td>
								<td>Nombre de la asignatura</td>
								<td>Hora de entrada</td>
								<td>Marcación de entrada</td>
								<td>Hora de salida</td>
								<td>Marcación de salida</td>
								<td>Puntualidad</td>
							</tr>
						</thead>
						<tbody>
						${assistances.length > 0 ? `${generateRow(assistances)}` : ''}		
						</tbody>
					</table>
				</div>
			</div>
		</body>
		
		</html>`;
		resolve(html);
	});
};
/**
 * STYLES
 */
const STYLES: string = `<style>
body {
	display: flex;
	align-items: center;
	background-color: gray;
	justify-content: center;
	font-family: "Times New Roman", Times, serif;
}

.reporte {
	width: 930px;
	height: auto;
	background-color: white;
	padding: 30px;
	padding-top: 20px;
}

.reporte>.header {
	display: flex;
	align-items: center;
	justify-content: center;
}

.reporte>.header>.containerLogo {
	width: 20%;
}

.reporte>.header>.containerLogo>img {
	width: 100%;
}

.reporte>.header>.containerTitle {
	display: flex;
	flex-direction: column;
	align-items: flex;
	justify-content: center;
	width: 80%;
	margin-left: 30px;
}

.reporte>.header>.containerTitle>h1 {
	color: black;
	font-size: 22px;
	font-weight: bold;
	margin: 2px;
}

.reporte>.header>.containerTitle>h2 {
	color: black;
	font-size: 16px;
	font-weight: 300;
	margin: 2px;
}

.reporte>.header>.containerTitle>h3 {
	color: black;
	font-size: 12px;
	font-weight: 300;
	margin: 2px;
}

.reporte>.containerBody>.title>h2 {
	color: black;
	font-size: 14px;
	font-weight: 300;
	padding: 0px 6px;
}

.reporte>.containerBody>.tableInst {
	width: 100%;
}

.reporte>.containerBody>.tableInst>thead>tr>td {
	color: black;
	font-size: 12px;
	font-weight: bold;
	padding: 5px 5px;

}

.reporte>.containerBody>.tableInst>tbody>tr>td {
	color: black;
	font-size: 12px;
	font-weight: lighter;
	padding: 1px 5px;
}

.reporte>.containerBody>.tableInst>tbody>.total>td {
	color: black;
	font-size: 13px;
	font-weight: bold;
	padding: 1px 5px;
}
</style>`;
/**
 * generateHeader
 * @returns header string
 */
const generateHeader = (title: string) => {
	return new Promise<string>(async (resolve, reject) => {
		/**
		 * Generate Base64 information for the logo
		 */
		let b64Logo = await generateImage2B64(`./public/resource/img/logo.png`);
		const _getFullDate = getFullDate(new Date().toString());

		resolve(`<div class="header">
				<div class="containerLogo">
					<img src="data:image/png;base64, ${b64Logo}" alt="logo">
				</div>
				<div class="containerTitle">
					<h1>UNIDAD EDUCATIVA BILINGÜE TSANTSA</h1>
					<h2>${title}</h2>
					<h3><strong>Generado: </strong>${_getFullDate.day}-${_getFullDate.month}-${_getFullDate.fullYear} ${_getFullDate.hours}:${_getFullDate.minutes}:${_getFullDate.seconds}</h3>
				</div>
			</div>`);
	});
};
