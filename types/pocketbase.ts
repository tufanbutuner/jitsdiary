/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Authorigins = "_authOrigins",
	Externalauths = "_externalAuths",
	Mfas = "_mfas",
	Otps = "_otps",
	Superusers = "_superusers",
	BeltProgressions = "belt_progressions",
	Gyms = "gyms",
	RollingRounds = "rolling_rounds",
	SessionTechniques = "session_techniques",
	Sessions = "sessions",
	Techniques = "techniques",
	Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type IsoAutoDateString = string & { readonly autodate: unique symbol }
export type RecordIdString = string
export type FileNameString = string & { readonly filename: unique symbol }
export type HTMLString = string

type ExpandType<T> = unknown extends T
	? T extends unknown
		? { expand?: unknown }
		: { expand: T }
	: { expand: T }

// System fields
export type BaseSystemFields<T = unknown> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
} & ExpandType<T>

export type AuthSystemFields<T = unknown> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AuthoriginsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated: IsoAutoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated: IsoAutoDateString
}

export type MfasRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	method: string
	recordRef: string
	updated: IsoAutoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated: IsoAutoDateString
}

export type SuperusersRecord = {
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

export enum BeltProgressionsBeltOptions {
	"white" = "white",
	"blue" = "blue",
	"purple" = "purple",
	"brown" = "brown",
	"black" = "black",
}
export type BeltProgressionsRecord = {
	belt: BeltProgressionsBeltOptions
	gym_id?: RecordIdString
	id: string
	notes?: string
	promoted_on: string
	stripes: number
	user_id: string
}

export type GymsRecord = {
	id: string
	location?: string
	name: string
}

export enum RollingRoundsPartnerBeltOptions {
	"white" = "white",
	"blue" = "blue",
	"purple" = "purple",
	"brown" = "brown",
	"black" = "black",
}

export enum RollingRoundsOutcomeOptions {
	"won" = "won",
	"lost" = "lost",
	"draw" = "draw",
}
export type RollingRoundsRecord = {
	duration_seconds?: number
	id: string
	notes?: string
	outcome?: RollingRoundsOutcomeOptions
	partner_belt?: RollingRoundsPartnerBeltOptions
	partner_name?: string
	partner_stripe?: number
	session_id: RecordIdString
}

export type SessionTechniquesRecord = {
	drill_count?: number
	id: string
	notes?: string
	session_id: RecordIdString
	technique_id: RecordIdString
}

export enum SessionsSessionTypeOptions {
	"gi" = "gi",
	"no_gi" = "no_gi",
	"open_mat" = "open_mat",
}
export type SessionsRecord = {
	coach?: string
	date: string
	duration_minutes?: number
	gym_id?: RecordIdString
	id: string
	notes?: string
	session_type: SessionsSessionTypeOptions
	user_id: string
}

export enum TechniquesCategoryOptions {
	"guard" = "guard",
	"mount" = "mount",
	"takedown" = "takedown",
	"submission" = "submission",
	"escape" = "escape",
	"transition" = "transition",
}
export type TechniquesRecord = {
	category: TechniquesCategoryOptions
	id: string
	name: string
}

export type UsersRecord = {
	avatar?: FileNameString
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	id: string
	name?: string
	password: string
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type BeltProgressionsResponse<Texpand = unknown> = Required<BeltProgressionsRecord> & BaseSystemFields<Texpand>
export type GymsResponse<Texpand = unknown> = Required<GymsRecord> & BaseSystemFields<Texpand>
export type RollingRoundsResponse<Texpand = unknown> = Required<RollingRoundsRecord> & BaseSystemFields<Texpand>
export type SessionTechniquesResponse<Texpand = unknown> = Required<SessionTechniquesRecord> & BaseSystemFields<Texpand>
export type SessionsResponse<Texpand = unknown> = Required<SessionsRecord> & BaseSystemFields<Texpand>
export type TechniquesResponse<Texpand = unknown> = Required<TechniquesRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	belt_progressions: BeltProgressionsRecord
	gyms: GymsRecord
	rolling_rounds: RollingRoundsRecord
	session_techniques: SessionTechniquesRecord
	sessions: SessionsRecord
	techniques: TechniquesRecord
	users: UsersRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	belt_progressions: BeltProgressionsResponse
	gyms: GymsResponse
	rolling_rounds: RollingRoundsResponse
	session_techniques: SessionTechniquesResponse
	sessions: SessionsResponse
	techniques: TechniquesResponse
	users: UsersResponse
}

// Utility types for create/update operations

type ProcessCreateAndUpdateFields<T> = Omit<{
	// Omit AutoDate fields
	[K in keyof T as Extract<T[K], IsoAutoDateString> extends never ? K : never]: 
		// Convert FileNameString to File
		T[K] extends infer U ? 
			U extends (FileNameString | FileNameString[]) ? 
				U extends any[] ? File[] : File 
			: U
		: never
}, 'id'>

// Create type for Auth collections
export type CreateAuth<T> = {
	id?: RecordIdString
	email: string
	emailVisibility?: boolean
	password: string
	passwordConfirm: string
	verified?: boolean
} & ProcessCreateAndUpdateFields<T>

// Create type for Base collections
export type CreateBase<T> = {
	id?: RecordIdString
} & ProcessCreateAndUpdateFields<T>

// Update type for Auth collections
export type UpdateAuth<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof AuthSystemFields>
> & {
	email?: string
	emailVisibility?: boolean
	oldPassword?: string
	password?: string
	passwordConfirm?: string
	verified?: boolean
}

// Update type for Base collections
export type UpdateBase<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof BaseSystemFields>
>

// Get the correct create type for any collection
export type Create<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? CreateAuth<CollectionRecords[T]>
		: CreateBase<CollectionRecords[T]>

// Get the correct update type for any collection
export type Update<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? UpdateAuth<CollectionRecords[T]>
		: UpdateBase<CollectionRecords[T]>

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = {
	collection<T extends keyof CollectionResponses>(
		idOrName: T
	): RecordService<CollectionResponses[T]>
} & PocketBase
