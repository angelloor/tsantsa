import { routerAssistance } from '../app/business/assistance/assistance.network';
import { routerAttached } from '../app/business/attached/attached.network';
import { routerCareer } from '../app/business/career/career.network';
import { routerComment } from '../app/business/comment/comment.network';
import { routerCommentForum } from '../app/business/comment_forum/comment_forum.network';
import { routerCourse } from '../app/business/course/course.network';
import { routerEnrollment } from '../app/business/enrollment/enrollment.network';
import { routerForum } from '../app/business/forum/forum.network';
import { routerGlossary } from '../app/business/glossary/glossary.network';
import { routerHome } from '../app/business/home/home.network';
import { routerPartial } from '../app/business/partial/partial.network';
import { routerPeriod } from '../app/business/period/period.network';
import { routerQuimester } from '../app/business/quimester/quimester.network';
import { routerResource } from '../app/business/resource/resource.network';
import { routerResourceCourse } from '../app/business/resource_course/resource_course.network';
import { routerTask } from '../app/business/task/task.network';
import { routerUserTask } from '../app/business/user_task/user_task.network';
import { routerAuth } from '../app/core/auth/auth.network';
import { routerCompany } from '../app/core/company/company.network';
import { routerNavigation } from '../app/core/navigation/navigation.network';
import { routerNewsletter } from '../app/core/newsletter/newsletter.network';
import { routerProfile } from '../app/core/profile/profile.network';
import { routerProfileNavigation } from '../app/core/profile_navigation/profile_navigation.network';
import { routerSession } from '../app/core/session/session.network';
import { routerSystemEvent } from '../app/core/system_event/system_event.network';
import { routerUser } from '../app/core/user/user.network';
import { routerValidation } from '../app/core/validation/validation.network';
import { routerReport } from '../app/report/report.network';
import { routerDev } from '../dev/dev.network';

export const appRoutes = (app: any) => {
	/**
	 * Core Routes
	 */
	app.use('/app/core/auth', routerAuth);

	app.use('/app/core/company', routerCompany);
	app.use('/app/core/newsletter', routerNewsletter);
	app.use('/app/core/validation', routerValidation);

	app.use('/app/core/navigation', routerNavigation);
	app.use('/app/core/profile', routerProfile);
	app.use('/app/core/profile_navigation', routerProfileNavigation);

	app.use('/app/core/user', routerUser);
	app.use('/app/core/system_event', routerSystemEvent);
	app.use('/app/core/session', routerSession);

	/**
	 * Business Routes
	 */
	app.use('/app/business/period', routerPeriod);
	app.use('/app/business/quimester', routerQuimester);
	app.use('/app/business/partial', routerPartial);
	app.use('/app/business/career', routerCareer);

	app.use('/app/business/course', routerCourse);
	app.use('/app/business/resource_course', routerResourceCourse);
	app.use('/app/business/forum', routerForum);
	app.use('/app/business/comment_forum', routerCommentForum);
	app.use('/app/business/glossary', routerGlossary);

	app.use('/app/business/enrollment', routerEnrollment);
	app.use('/app/business/task', routerTask);
	app.use('/app/business/resource', routerResource);
	app.use('/app/business/user_task', routerUserTask);
	app.use('/app/business/attached', routerAttached);
	app.use('/app/business/comment', routerComment);
	app.use('/app/business/assistance', routerAssistance);
	app.use('/app/business/home', routerHome);

	/**
	 * Report Route
	 */
	app.use('/app/report', routerReport);
	/**
	 * Dev Routes
	 */
	app.use('/dev', routerDev);
};
