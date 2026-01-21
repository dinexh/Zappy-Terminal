export { Terminal } from "./terminal";

export {
  Output,
  toOutput,
  mergeOutputs,
  withMetadata,
  withTitle,
  isTextOutput,
  isTableOutput,
  isListOutput,
  isTreeOutput,
  isErrorOutput,
  isSuccessOutput,
  isCompositeOutput,
} from "./output";

export {
  PresentationLayer,
  createPresentationContext,
  defaultPresentation,
} from "./presentation";

export {
  CommandPipelineImpl,
  createPipeline,
  defaultPipeline,
  createStep,
  createPlan,
  emitEvent,
  logProgress,
  logDebug,
} from "./pipeline";

export {
  CustomCommandBuilder,
  CustomCommandRegistry,
  defineCommand,
  createCustomRegistry,
  CustomCommands,
  loadCommandsFromFile,
  saveCommandsToFile,
} from "./customCommands";
