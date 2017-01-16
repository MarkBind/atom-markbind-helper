'use babel';

import {
  CompositeDisposable
} from 'atom';
import MarkBind from 'markbind';
import fs from 'fs';
import path from 'path';

export default {
  subscriptions: null,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'markbind-helper:include': () => this.include()
    }));

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'markbind-helper:render': () => this.render()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
  },

  serialize() {
    return {};
  },

  include() {
    let editor;
    if (editor = atom.workspace.getActiveTextEditor()) {
      let content = editor.getText();
      let path = editor.getPath();

      if (this._isUnsupportedFileType(path)) {
        atom.notifications.addWarning('Unsupported file type. Only markdown and html are currently supported.');
        return;
      }

      new MarkBind().includeFile(path)
        .then((data) => {
          atom.workspace.open().then((newEditor) => {
            newEditor.insertText(data);
          }).catch((error) => {
            atom.notifications.addWarning(error.reason);
          });
        })
        .catch((err) => {
          atom.notifications.addError(err.message);
        });
    }
  },

  render() {
    let editor;
    if (editor = atom.workspace.getActiveTextEditor()) {
      let content = editor.getText();
      let path = editor.getPath();

      if (this._isUnsupportedFileType(path)) {
        atom.notifications.addWarning('Unsupported file type. Only markdown and html are currently supported.');
        return;
      }

      new MarkBind().renderFile(path)
        .then((data) => {
          atom.workspace.open().then((newEditor) => {
            newEditor.insertText(data);
          }).catch((error) => {
            atom.notifications.addWarning(error.reason);
          });
        })
        .catch((err) => {
          atom.notifications.addError(err.message);
        });
    }
  },

  _isUnsupportedFileType(file) {
    let ext = path.extname(file);
    return ext !== '.md' && ext !== '.html';
  }
};
