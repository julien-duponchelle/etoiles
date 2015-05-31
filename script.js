var repositories = {
    "docker/docker": {"raise": 150, "name": "Docker"},
    "elastic/elasticsearch": {"raise": 104, "name": "Elastic Search"},
    "TryGhost/ghost": {"raise": 0.3, "name": "Ghost"},
    "meteor/meteor": {"raise": 31.2, "name": "Meteor"},
    "mongodb/mongo": {"raise": 311.1 ,"name": "MongoDB"},
    "PrestaShop/PrestaShop": {"raise": 14.8, "name": "PrestaShop"},
    "basho/riak": {"raise": 57.5 ,"name": "Riak"},
};


function getParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

$(function() {
    var reference = $('select[name="reference"]');
    for (var repo_name in repositories) {
        reference.append($("<option>").attr("value", repo_name).text(repositories[repo_name]["name"]));
    }

    var repository = getParameterByName("repository")
    if (repository) {
        repository = repository.replace(/[\s\/]+$/g, '');
        $('input[name="repository"]').val(repository);
    }
    var reference = getParameterByName("reference");
    if (reference) {
        reference = reference.replace(/[\s\/]+$/g, '');
        $('select[name="reference"]').val(reference);
    }
    onSubmit();
});


function getRepo(repository) {
    var promise = $.Deferred();
    $.get("https://api.github.com/repos/" + repository, function(answer) {
        promise.resolve(answer);
    }).fail(function(error) {
        promise.reject(error);
    });
    return promise;
}

function addResultRow(raise, reference, repo, key, name) {
    var tr = $("<tr>");

    tr.append($("<td>").text(name));
    tr.append($("<td>").text(reference[key]));
    tr.append($("<td>").text(repo[key]));

    var valuation = Math.round(raise / reference[key] * repo[key]);
    var one = Math.round(raise / reference[key]);
    tr.append($("<td>").text(one.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') + " $ / " + name));
    tr.append($("<td>").text(valuation.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') + " $"));
    return tr;
}

function onSubmit() {
    var repo = $('input[name="repository"]').val();
    var reference = $('select[name="reference"]').val();


    $.when(getRepo(repo), getRepo(reference)).done(function(repo, reference) {
        var stats = $("#stats");
        console.log(repo);
        stats.html("");

        var raise = repositories[reference["full_name"]]["raise"] * 1000000;

        stats.append($("<h1>").text(reference["name"] + " / " + repo["name"]));
        stats.append($("<p>")
            .text(reference["name"] + " raised " + raise.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') + " $")
            .attr('id', 'raise'));

        var table = $("<table>");

        var tr = $("<tr>");
        tr.append($("<th>"));
        tr.append($("<th>").text(reference["name"]));
        tr.append($("<th>").text(repo["name"]));
        tr.append($("<th>").text("Value for one element"));
        tr.append($("<th>").text("Estimate fund raising"));
        table.append(tr);

        table.append(addResultRow(raise, reference, repo, "stargazers_count", "stargazers"));
        table.append(addResultRow(raise, reference, repo, "subscribers_count", "subscribers"));
        table.append(addResultRow(raise, reference, repo, "forks", "forks"));
        table.append(addResultRow(raise, reference, repo, "open_issues", "open issues"));
        stats.append(table);

        //TODO: Display watcher price
    });

    return false;
}

