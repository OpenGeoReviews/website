# Generated by Django 2.1.8 on 2019-06-16 18:25

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('profiles', '0004_user_oauth_hash'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='oauth_hash',
        ),
    ]
