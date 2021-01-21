import { Component, OnDestroy, OnInit,  } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css'],
})
export class PostListComponent implements OnInit, OnDestroy {
  // posts = [
  //   { title: 'First post', content: 'blabla' },
  //   { title: 'Second post', content: 'blabla' },
  //   { title: 'Third post', content: 'blabla' },
  // ];

  totalPosts = 10;
  postsPerPage = 2;
  pageSizeOptions = [1, 2, 3, 10];

  spinnerLoading = false;
  posts: Post[] = [];
  private postsSub: Subscription;

  constructor(public postsService: PostsService) {
  }

  onChangePage(pageData: PageEvent) {
    console.log(pageData);
  }

  nextStep(){}

  onDelete(postId: string){
    this.postsService.deletePost(postId);
  }

  ngOnInit(): void {
    this.spinnerLoading = true;
    this.postsService.getPosts();
    this.postsSub = this.postsService.getPostUpdateListener()
    .subscribe((posts: Post[]) => {
      this.spinnerLoading = false;
      this.posts = posts;
    })
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
  }
}
