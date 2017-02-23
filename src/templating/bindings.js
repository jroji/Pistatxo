
/**
 * replace the bindings syntax using defined pipes
 */
export const _replaceBindings = (a, properties, pipes) => {
  let result = a.replace('{{','').replace('}}','');
  result = result.split('|');

  let pipe = result[1] ? pipes[result[1].trim()] : null;
  let value = properties[result[0].trim()].value;

  return pipe ? pipe(value) : value;
};
