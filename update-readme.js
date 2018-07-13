/**
 * This example generated adds content to the repos README.md file
 */
const fs = require('fs');
const path = require('path');
const {URL} = require('url');
const markdownMagic = require('markdown-magic');

const commonPartRe = /(?:(?:^|-)jovo-plugin(?:-|$))|(?:(?:^|-)jovo(?:-|$))/;

const config = {
  transforms: {
    /*
    Fills <!-- AUTO-GENERATED-CONTENT:START (updatePluginTable)-->
     */
    updatePluginTable(content, options) {
      const commandsFile = path.join(__dirname, 'plugins.json')
      const plugins = JSON.parse(fs.readFileSync(commandsFile, 'utf8'))
      let md =  '| Plugin |\n'
       md += '|:---------------------------|\n'

      plugins.sort(function (a, b) {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        return aName.replace(commonPartRe, '').localeCompare(bName.replace(commonPartRe, '')) ||
          aName.localeCompare(bName);
      }).forEach(function(data) {
          const userName = getUsernameFromGithubUrl(data.githubUrl)
          const profileUrl = `http://github.com/${userName}`
          const repoName = data.githubUrl.split('.com/')[1];
          md += `**[${formatPluginName(data.name)} - \`${data.name.toLowerCase()}\`](${data.githubUrl})** <br/> by [${userName}](${profileUrl}) <br/>`
          md += ` ${data.description} |\n`
      });
      return md.replace(/^\s+|\s+$/g, '')
    }
  }
}

/**
 * Creates URL Object from url string and cuts out the username from the path
 * @param {String} url 
 */
function getUsernameFromGithubUrl(url) {
  if (!url) {
    throw new Error('Please include the url of your Github repository');
  }
  // https://nodejs.org/docs/latest/api/url.html#url_url_strings_and_url_objects
  let urlObject = new URL(url);
  let path = urlObject.pathname;

  // Cut out first '/'
  if (path.length && path.charAt(0) === '/') {
    path = path.slice(1);
  }

  let username = path.split('/')[0];
  return username;
}

function formatPluginName (string) {
  return toTitleCase(string.toLowerCase().replace(commonPartRe, '').replace(/-/g, ' '))
}

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  )
}

const markdownPath = path.join(__dirname, 'README.md')
markdownMagic(markdownPath, config, function() {
  console.log('Docs updated!')
})