import Persister from '@pollyjs/persister';

export default class WormholePersister extends Persister {
  static get name() {
    return 'wormhole-storage';
  }

  get defaultOptions() {
    return {
      key: 'pollyjs',
      context: global
    };
  }

  findRecording(recordingId) {
    return null;
  }

  saveRecording(recordingId, data) {
    return null;
  }

  deleteRecording(recordingId) {
    return null;
  }
}
