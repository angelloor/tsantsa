export interface BodyBackendGenerate {
	scheme: string;
	entity: string;
	attributeToQuery: string;
}

export interface BodyFrontendGenerate {
	scheme: string;
	entity: string;
	nameVisibility: string;
	pathToCreate: string;
	attributeList: AttributeList;
}

export interface AttributeList {
	first: string;
	second: string;
}
