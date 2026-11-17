/** Событие «выбрана модель»: карточка каталога сообщает форме заявки, какую модель подставить. */
export const LEAD_MODEL_EVENT = "uvelo:lead-model";

export function selectLeadModel(model: string) {
  window.dispatchEvent(new CustomEvent<string>(LEAD_MODEL_EVENT, { detail: model }));
}
