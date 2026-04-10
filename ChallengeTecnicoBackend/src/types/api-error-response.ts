export interface ApiErrorDetailDto {
  readonly field: string;
  readonly message: string;
}

export interface ApiErrorResponseDto {
  readonly code?: string;
  readonly message: string;
  readonly errors?: readonly ApiErrorDetailDto[];
}
