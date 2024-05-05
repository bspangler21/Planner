/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { MSGraphClientV3 } from "@microsoft/sp-http";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getTaskDetails = (
	taskId: string,
	context: WebPartContext
): any => {
	// Call the Graph API to get the task details
	context.msGraphClientFactory
		.getClient("3")
		.then((client: MSGraphClientV3): void => {
			client
				.api(`planner/tasks/${taskId}/details`)
				.get((_error, task: any, _rawResponse?: any): void => {
					// Process the task details
					console.log(task);
				});
		});
};
