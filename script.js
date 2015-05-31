var repositories = {
    "docker/docker": {"raise": 150, "name": "Docker"},
    "basho/riak": {"raise": 57.5 ,"name": "Riak"},
    "mongodb/mongo": {"raise": 311.1 ,"name": "MongoDB"},
    "elastic/elasticsearch": {"raise": 104, "name": "Elastic Search"},
    "PrestaShop/PrestaShop": {"raise": 14.8, "name": "PrestaShop"}
};

$(function() {
    var reference = $('select[name="reference"]');
    for (var repo_name in repositories) {
        reference.append($("<option>").attr("value", repo_name).text(repositories[repo_name]["name"]));
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

