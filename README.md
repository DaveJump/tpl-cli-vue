🛠  A boilerplate tool for vue development.

> This cli tool depends on vue-cli 3.x, make sure you already installed it globally, otherwise it will generate the preset by `npx`.

## Usage

### Install cli tool

```bash
$ npm install -g @djp6/tpl-cli-vue
```

### install template

There are two templates you can pick when initializing.

- [x] mobile (implemented by Vant, use for mobile application)

- [ ] desktop (implemeted by element-ui, use for desktop(PC) application)

You should install template globally first. it provides two ways for installation.

1. By npm

```bash
$ npm install -g @djp6/tpl-<templateName>
```

2. By cli command

```bash
$ tplcli install [templateName]
```

> `templateName` should be one of `mobile,desktop`.

### Initialize project

After installing template, run `tplcli init [projectName] --template <templateName>` to initialize your project. Of course, you can also create a project by using vue-cli raw command `vue create --preset <remote-repo-path> --clone <projectName>`, but it is not so friendly for user to remember the long `repo-path` and the preset on remote cannot be versioned. Certainly, in order to reuse template's common modules, some preset files will be removed from template's directory later on, it means that generating project by vue-cli raw command with these templates will be inaccessible.

### Commands and options

Run `tplcli --help` and `tplcli <command> --help` for more details.

### TODOS

- [ ] Create and publish `desktop` template
