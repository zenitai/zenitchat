import {
  GatewayError,
  GatewayRateLimitError,
  GatewayAuthenticationError,
  GatewayModelNotFoundError,
  GatewayInvalidRequestError,
  GatewayInternalServerError,
  GatewayResponseError,
} from "@ai-sdk/gateway";
import {
  AISDKError,
  APICallError,
  DownloadError,
  EmptyResponseBodyError,
  InvalidArgumentError,
  InvalidDataContentError,
  InvalidMessageRoleError,
  InvalidPromptError,
  InvalidResponseDataError,
  InvalidToolInputError,
  JSONParseError,
  LoadAPIKeyError,
  MessageConversionError,
  NoContentGeneratedError,
  NoImageGeneratedError,
  NoObjectGeneratedError,
  NoOutputSpecifiedError,
  NoSuchModelError,
  NoSuchProviderError,
  NoSuchToolError,
  RetryError,
  ToolCallRepairError,
  TooManyEmbeddingValuesForCallError,
  TypeValidationError,
  UnsupportedFunctionalityError,
} from "ai";

/**
 * Transforms any error into a user-friendly message
 * Checks gateway errors first, then AI SDK errors, then falls back to generic
 */
export const transformError = (error: unknown): string => {
  // Check if it's a gateway error first
  if (GatewayError.isInstance(error)) {
    return mapGatewayError(error);
  }

  // Check if it's an AI SDK error
  if (AISDKError.isInstance(error)) {
    return mapAISDKError(error);
  }

  // For unknown errors, return a generic message
  return "An error occurred while processing your request. Please try again.";
};

/**
 * Maps Vercel AI Gateway errors to user-friendly messages
 */
export const mapGatewayError = (error: GatewayError): string => {
  if (GatewayRateLimitError.isInstance(error)) {
    return "We're experiencing high demand from our AI provider. Please wait a moment and try again.";
  }

  if (GatewayAuthenticationError.isInstance(error)) {
    return "We're experiencing authentication issues with our AI provider. Please try again in a moment.";
  }

  if (GatewayModelNotFoundError.isInstance(error)) {
    return "The selected AI model does not exist. Please try a different model.";
  }

  if (GatewayInvalidRequestError.isInstance(error)) {
    return "We're experiencing issues processing your request. Please try again.";
  }

  if (GatewayInternalServerError.isInstance(error)) {
    return "We're experiencing technical difficulties. Please try again in a moment.";
  }

  if (GatewayResponseError.isInstance(error)) {
    return "We're experiencing issues processing the AI response. Please try again.";
  }

  // This should never be reached since we check GatewayError.isInstance(error) first
  return "We're experiencing issues with our AI service. Please try again.";
};

/**
 * Maps AI SDK errors to user-friendly messages
 */
export const mapAISDKError = (error: AISDKError): string => {
  // API Call Errors (HTTP/Network)
  if (APICallError.isInstance(error)) {
    const statusCode = error.statusCode;
    const isRetryable = error.isRetryable;

    if (statusCode === 401 || statusCode === 403) {
      return "We're experiencing authentication issues with our AI provider. Please try again in a moment.";
    }

    if (statusCode === 429) {
      return "We're experiencing high demand from our AI provider. Please wait a moment and try again.";
    }

    if (statusCode === 500 || statusCode === 502 || statusCode === 503) {
      return isRetryable
        ? "Our AI provider is experiencing server issues. Please try again in a moment."
        : "Our AI provider is currently experiencing server issues.";
    }

    if (statusCode === 504) {
      return isRetryable
        ? "Our AI provider is experiencing timeouts. Please try again in a moment."
        : "Our AI provider is currently experiencing timeouts.";
    }

    if (statusCode && statusCode >= 400 && statusCode < 500) {
      return isRetryable
        ? "Our AI provider is experiencing request issues. Please try again."
        : "Our AI provider is currently experiencing request issues.";
    }

    return isRetryable
      ? "We're experiencing issues connecting to our AI provider. Please try again."
      : "We're currently experiencing issues connecting to our AI provider.";
  }

  // Load API Key Errors
  if (LoadAPIKeyError.isInstance(error)) {
    return "We're experiencing configuration issues with our AI provider. Please try again in a moment.";
  }

  // Download Errors
  if (DownloadError.isInstance(error)) {
    return "We're experiencing issues downloading content from our AI provider. Please try again.";
  }

  // Empty Response Body Errors
  if (EmptyResponseBodyError.isInstance(error)) {
    return "Our AI provider returned an empty response. Please try again.";
  }

  // Invalid Argument Errors
  if (InvalidArgumentError.isInstance(error)) {
    return "We're experiencing issues processing your request. Please try again.";
  }

  // Invalid Data Content Errors
  if (InvalidDataContentError.isInstance(error)) {
    return "We're experiencing issues processing your request data. Please try again.";
  }

  // Invalid Message Role Errors
  if (InvalidMessageRoleError.isInstance(error)) {
    return "We're experiencing issues processing your message. Please try again.";
  }

  // Invalid Prompt Errors
  if (InvalidPromptError.isInstance(error)) {
    return "We're experiencing issues processing your prompt. Please try again.";
  }

  // Invalid Response Data Errors
  if (InvalidResponseDataError.isInstance(error)) {
    return "Our AI provider returned invalid data. Please try again.";
  }

  // Invalid Tool Input Errors
  if (InvalidToolInputError.isInstance(error)) {
    return "The AI model provided invalid tool input. Please try again.";
  }

  // JSON Parse Errors
  if (JSONParseError.isInstance(error)) {
    return "We're experiencing issues parsing the response. Please try again.";
  }

  // Message Conversion Errors
  if (MessageConversionError.isInstance(error)) {
    return "We're experiencing issues processing your request. Please try again.";
  }

  // Model Errors
  if (NoSuchModelError.isInstance(error)) {
    return "The selected AI model does not exist. Please try a different model.";
  }

  // Provider Errors
  if (NoSuchProviderError.isInstance(error)) {
    return "We're experiencing configuration issues with our AI provider. Please try again later.";
  }

  // Tool Errors
  if (NoSuchToolError.isInstance(error)) {
    return "The AI model called a non-existent tool. Please try again.";
  }

  // Content Generation Errors
  if (NoContentGeneratedError.isInstance(error)) {
    return "The AI model failed to generate any content. Please try again.";
  }

  // Image Generation Errors
  if (NoImageGeneratedError.isInstance(error)) {
    return "The AI model failed to generate any image. Please try again.";
  }

  // Object Generation Errors
  if (NoObjectGeneratedError.isInstance(error)) {
    return "The AI model failed to generate any object. Please try again.";
  }

  // Output Specification Errors
  if (NoOutputSpecifiedError.isInstance(error)) {
    return "We're experiencing configuration issues with our AI provider. Please try again later.";
  }

  // Retry Errors
  if (RetryError.isInstance(error)) {
    const reason = error.reason;

    if (reason === "maxRetriesExceeded") {
      return "All retry attempts have been exhausted. Please try again later.";
    }

    if (reason === "errorNotRetryable") {
      return "We encountered a non-retryable error. Please try again later.";
    }

    if (reason === "abort") {
      return "The request was aborted. Please try again.";
    }

    return "We're experiencing issues with your request. Please try again later.";
  }

  // Tool Call Repair Errors
  if (ToolCallRepairError.isInstance(error)) {
    return "The AI model failed to fix its invalid tool call. Please try again.";
  }

  // Too Many Embedding Values Errors
  if (TooManyEmbeddingValuesForCallError.isInstance(error)) {
    return "Too many embedding values provided. Please reduce the input size and try again.";
  }

  // Type Validation Errors
  if (TypeValidationError.isInstance(error)) {
    return "Request validation failed. Please try again.";
  }

  // Unsupported Functionality Errors
  if (UnsupportedFunctionalityError.isInstance(error)) {
    return "This model does not support this functionality. Please try a different model.";
  }

  // This should never be reached since we check AISDKError.isInstance(error) first
  return "An error occurred while processing your request. Please try again.";
};
